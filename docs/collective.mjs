// FORTUNA browser model. Initial weights are declared software parameters.
const keys=['ev','joy','stability','risk'];
const fields=['probability','payout','cost','joy','stability','risk'];
const encoder=new TextEncoder();
async function digest(value){return new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
const hex=bytes=>[...bytes].map(byte=>byte.toString(16).padStart(2,'0')).join('');
function compare(a,b){
  const left=[...a].map(c=>c.codePointAt(0)),right=[...b].map(c=>c.codePointAt(0));
  for(let i=0;i<Math.min(left.length,right.length);i++)if(left[i]!==right[i])return left[i]-right[i];
  return left.length-right.length;
}
function weights(value){
  if(!value||Array.isArray(value)||Object.keys(value).sort().join(',')!==[...keys].sort().join(','))throw Error('Vier vollständige Gewichte erforderlich.');
  for(const key of keys)if(typeof value[key]!=='number'||!Number.isFinite(value[key])||value[key]<0||value[key]>10)throw Error('Gewicht außerhalb 0..10.');
  if(!keys.some(key=>value[key]>0))throw Error('Mindestens ein Gewicht muss positiv sein.');
  return {...value};
}
export async function createMembers(data){
  if(data.schema!=='FORTUNA_MEMBERS_1'||!Array.isArray(data.members)||data.members.length!==70)throw Error('Genau 70 gebundene Profile erforderlich.');
  const seen=new Set();
  for(const row of data.members){
    if(Object.keys(row).sort().join(',')!=='id,label,origin'||typeof row.id!=='string'||!/^[a-z0-9-]{1,100}$/.test(row.id)||seen.has(row.id))throw Error('Ungültige Profiladresse.');
    if(typeof row.label!=='string'||!row.label.length||row.label.length>160||!['PUBLIC_SOFTWARE_FIGURE_LABEL','ADDED_LOCAL_SOFTWARE_PROFILE'].includes(row.origin))throw Error('Ungültige Profilherkunft.');
    seen.add(row.id);
  }
  return Promise.all(data.members.map(async row=>{
    const seed=await digest('FORTUNA_PROFILE_V1|'+row.id);
    return {id:row.id,label:row.label,origin:row.origin,
      identitySha256:hex(await digest('FORTUNA_SOFTWARE_ENTITY_V1|'+row.id)),
      preferences:{ev:.25+seed[0]/85,joy:.25+seed[1]/85,stability:.25+seed[2]/85,risk:.25+seed[3]/85}};
  }));
}
function validateCandidates(candidates){
  if(!Array.isArray(candidates)||candidates.length>1000)throw Error('Maximal 1000 Möglichkeiten erforderlich.');
  const seen=new Set();
  return candidates.map(candidate=>{
    if(!candidate||Array.isArray(candidate)||Object.keys(candidate).some(key=>![...fields,'id','allowed'].includes(key)))throw Error('Ungültige Möglichkeit.');
    if(typeof candidate.id!=='string'||!candidate.id.trim()||candidate.id.length>100||seen.has(candidate.id))throw Error('Eindeutige Namen mit 1..100 Zeichen erforderlich.');
    seen.add(candidate.id);
    const allowed=candidate.allowed??null;
    if(allowed!==null&&typeof allowed!=='boolean')throw Error('Freigabe muss true, false oder null sein.');
    const row={id:candidate.id,allowed};
    for(const field of fields){
      const value=candidate[field]??null;
      const max=field==='probability'?1:['payout','cost'].includes(field)?1e12:100;
      if(value!==null&&(typeof value!=='number'||!Number.isFinite(value)||value<0||value>max))throw Error(candidate.id+': Wert außerhalb des erlaubten Bereichs.');
      row[field]=value;
    }
    return row;
  });
}
export function decide(members,candidates,baseWeights={ev:1,joy:1,stability:1,risk:1},mode='FORTUNA'){
  if(members.length!==70||new Set(members.map(member=>member.id)).size!==70)throw Error('70 eindeutige Profile erforderlich.');
  if(!['FORTUNA','ANTICASINO'].includes(mode))throw Error('Unbekannter Modus.');
  const base=weights(baseWeights),input=validateCandidates(candidates);
  const ballots=members.map(member=>{
    const own=weights(member.preferences),combined=Object.fromEntries(keys.map(key=>[key,Math.min(10,own[key]*base[key])]));
    const ranked=input.filter(row=>row.allowed===true&&fields.every(field=>row[field]!==null)).map(row=>{
      const ev=row.probability*row.payout-row.cost;
      return {...row,ev,score:(mode==='ANTICASINO'?10:1)*ev*combined.ev+row.joy*combined.joy+row.stability*combined.stability-(mode==='ANTICASINO'?2:1)*row.risk*combined.risk};
    }).filter(row=>mode!=='ANTICASINO'||row.ev>=0).sort((a,b)=>b.score-a.score||b.ev-a.ev||compare(a.id,b.id));
    const selected=ranked[0]??null;
    return {entityId:member.id,label:member.label,identitySha256:member.identitySha256,preferences:combined,candidateId:selected?.id??null,score:selected?.score??null,status:selected?'SELECTED':'NO_ELIGIBLE_CANDIDATE'};
  });
  const counts=new Map();for(const row of ballots)if(row.candidateId!==null)counts.set(row.candidateId,(counts.get(row.candidateId)??0)+1);
  const votes=[...counts].map(([id,count])=>({id,votes:count})).sort((a,b)=>b.votes-a.votes||compare(a.id,b.id));
  const tied=votes.filter(row=>row.votes===votes[0]?.votes).map(row=>row.id);
  return {schema:'FORTUNA_BROWSER_COLLECTIVE_1',ballots,votes,abstentions:ballots.filter(row=>row.candidateId===null).length,
    selected:tied.length===1?tied[0]:null,status:tied.length===1?'SELECTED_BY_VOTES':tied.length?'OPEN_TIE':'OPEN_NO_ELIGIBLE_INPUT',
    engine:'SHARED_LOCAL_DETERMINISTIC_ENGINE',profileOrigin:'DERIVED_INITIAL_PREFERENCES_V1',externalExecution:'NOT_PERFORMED',chanceMutation:'NOT_PERFORMED'};
}
