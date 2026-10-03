import {createMembers,decide} from './collective.mjs';
const panel=document.querySelector('#collective'),summary=document.querySelector('#collective-status'),body=document.querySelector('#collective-members'),detail=document.querySelector('#collective-detail');
const columns=['id','probability','payout','cost','joy','stability','risk'];
let members=[],current=null;
const text=(tag,value)=>{const node=document.createElement(tag);node.textContent=value;return node;};
function showDetail(member){
  const ballot=current?.ballots.find(row=>row.entityId===member.id);
  detail.textContent=`${member.label} · Adresse ${member.id}\nIdentitätsanker ${member.identitySha256}\nAktuelle Auswahl: ${ballot?.candidateId??'offen'} · ${ballot?.status??'OPEN'}`;
}
function draw(){
  body.replaceChildren();
  for(const member of members){
    const ballot=current?.ballots.find(row=>row.entityId===member.id),row=document.createElement('tr');
    const cell=document.createElement('td'),button=text('button',member.label);button.type='button';button.className='profile-choice';button.onclick=()=>showDetail(member);cell.append(button);row.append(cell);
    row.append(text('td',ballot?.candidateId??'offen'));
    for(const key of ['ev','joy','stability','risk'])row.append(text('td',(ballot?.preferences??member.preferences)[key].toFixed(2)));
    body.append(row);
  }
}
function addRow(){
  const row=document.createElement('tr');
  for(const field of columns){
    const cell=document.createElement('td'),input=document.createElement('input');input.dataset.field=field;
    input.setAttribute('aria-label',`${document.querySelector(`[data-header="${field}"]`).textContent} Möglichkeit ${document.querySelectorAll('#collective-options tr').length+1}`);
    input.type=field==='id'?'text':'number';
    if(field==='id'){input.maxLength=100;input.placeholder='Eigene Möglichkeit';}
    else{input.min=0;input.max=['payout','cost'].includes(field)?1e12:100;input.step='any';}
    cell.append(input);row.append(cell);
  }
  document.querySelector('#collective-options').append(row);
}
function readOptions(){
  return [...document.querySelectorAll('#collective-options tr')].flatMap(row=>{
    const inputs=[...row.querySelectorAll('input')];if(inputs.every(input=>input.value===''))return [];
    const value={allowed:true};
    for(const input of inputs){
      if(input.dataset.field==='id')value.id=input.value;
      else{
        if(input.validity.badInput)throw Error('Bitte eine gültige Zahl eingeben.');
        const number=input.value===''?null:Number(input.value);
        value[input.dataset.field]=input.dataset.field==='probability'&&number!==null?number/100:number;
      }
    }
    return [value];
  });
}
document.querySelector('#collective-open').onclick=()=>{panel.showModal();document.querySelector('#collective-close').focus();};
document.querySelector('#collective-close').onclick=()=>panel.close();
document.querySelector('#collective-add').onclick=()=>{if(document.querySelectorAll('#collective-options tr').length<6)addRow();};
document.querySelector('#collective-example').onclick=()=>{
  document.querySelector('#collective-options').replaceChildren();addRow();addRow();
  const values=[['Nutzen',50,60,0,1,1,0],['Freude',50,1,0,30,1,0]];
  [...document.querySelectorAll('#collective-options tr')].forEach((row,index)=>[...row.querySelectorAll('input')].forEach((input,column)=>input.value=values[index][column]));
  current=null;draw();summary.textContent='Zwei ausdrücklich erfundene Beispieloptionen geladen. Gemeinsam auswählen berechnet sie.';
};
document.querySelector('#collective-form').onsubmit=event=>{
  event.preventDefault();
  try{
    const result=decide(members,readOptions());current=result;draw();
    summary.textContent=result.selected!==null?`Gemeinsame Auswahl: ${result.selected} · ${result.votes[0].votes}/70 Stimmen · ${result.abstentions} Enthaltungen`:
      result.status==='OPEN_TIE'?'Gleichstand: Die gemeinsame Auswahl bleibt offen.':`Offen: ${result.abstentions}/70 Profile haben keine vollständig bewertbare Möglichkeit.`;
    detail.textContent='Ein Profil anklicken: seine stabile Adresse und aktuelle Einzelentscheidung ansehen.';
  }catch(error){current=null;draw();summary.textContent=`Eingabe prüfen: ${error.message}`;detail.textContent='Die ungültige Eingabe wurde nicht durch einen Standardwert ersetzt.';}
};
try{
  const response=await fetch('collective-members.json');if(!response.ok)throw Error('Profilquelle nicht geladen.');
  const source=await response.json();members=await createMembers(source);
  const publicRows=source.members.filter(row=>row.origin==='PUBLIC_SOFTWARE_FIGURE_LABEL');
  if(window.HalvethUniverse.entities.length!==69||publicRows.some(row=>!window.HalvethUniverse.entities.some(entity=>entity.id===row.id&&entity.label===row.label)))throw Error('Figurenquelle passt nicht zum gebundenen Kollektiv.');
  addRow();addRow();draw();summary.textContent='70 Profile bereit. Eigene Möglichkeiten eintragen oder ein Beispiel laden.';
}catch(error){summary.textContent=error.message;document.querySelector('#collective-calculate').disabled=true;}
