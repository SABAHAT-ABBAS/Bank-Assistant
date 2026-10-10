import {ACTIONS,menu,transition,fresh} from './engine.js';
const $=id=>document.getElementById(id);
const KEY='bankassist-demo-cases-v1';
function load(){try{const data=JSON.parse(localStorage.getItem(KEY)||'{}');return data&&typeof data==='object'?data:{}}catch{return {}}}
let cases=load(),state=fresh(),toastTimer;
const nav=$('navigation');
for(const action of ACTIONS){const button=document.createElement('button');button.type='button';button.dataset.action=action.id;const icon=document.createElement('span');icon.className='nav-icon';icon.textContent=action.icon;button.append(icon,document.createTextNode(action.label));button.addEventListener('click',()=>send(action.id));nav.append(button)}
const restart=document.createElement('button');restart.type='button';restart.dataset.action='restart';restart.innerHTML='<span class="nav-icon" aria-hidden="true">↻</span> New conversation';restart.addEventListener('click',()=>send('restart'));nav.append(restart);
function bubble(text,person='agent'){
 const container=document.createElement('div');container.className='message '+(person==='user'?'mine':'');
 const avatar=document.createElement('span');avatar.className='mini-avatar';avatar.textContent=person==='user'?'●':'✦';avatar.setAttribute('aria-hidden','true');
 const body=document.createElement('div');const message=document.createElement('div');message.className='bubble';message.textContent=text;
 const time=document.createElement('div');time.className='timestamp';time.textContent=person==='user'?'You':'BankAssist';
 body.append(message,time);container.append(avatar,body);$('messages').append(container);$('messages').scrollTop=$('messages').scrollHeight;
}
function render(result){
 state=result.state;
 for(const text of result.messages)bubble(text);
 const suggestions=$('suggestions');suggestions.replaceChildren();
 for(const item of result.choices){const button=document.createElement('button');button.type='button';button.textContent=item.label;button.addEventListener('click',()=>send(item.value,item.label));suggestions.append(button)}
 if(result.effect?.kind==='save'){
  const record=result.effect.record;cases[record.id]=record;try{localStorage.setItem(KEY,JSON.stringify(cases))}catch{notify('Browser storage unavailable; tracking may not persist.')}
 }
 const steps=['category','amount','date','description','confirm'];const stage=steps.indexOf(state.step);
 $('progress-text').textContent=state.mode==='report'?'Complaint setup · Step '+(stage+1)+' of 5':state.mode==='track'?'Complaint tracking':state.mode==='menu'?'Choose a support task':state.mode==='completed'?'Demo complaint saved':'Guidance and support';
 $('progress-fill').style.width=stage>=0?((stage+1)/5*100)+'%':state.mode==='completed'?'100%':'0%';
 document.querySelectorAll('.nav button').forEach(button=>button.classList.toggle('active',button.dataset.action===state.mode));
 $('message-input').placeholder=state.mode==='report'&&state.step==='date'?'YYYY-MM-DD':state.mode==='track'?'Enter BA-123456':state.mode==='report'&&state.step==='amount'?'Enter amount in PKR':'Type your reply here...';
 $('message-input').focus();
}
function send(value,label){const text=String(value||'').trim();if(!text)return;bubble(label||text,'user');const result=transition(state,text,cases);render(result);$('message-input').value=''}
function notify(message){const e=$('toast');e.textContent=message;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3000)}
$('message-form').addEventListener('submit',event=>{event.preventDefault();send($('message-input').value)});
$('restart').addEventListener('click',()=>{bubble('Restart','user');render(menu());notify('Conversation restarted')});
$('back').addEventListener('click',()=>send('back','Back'));
$('clear-data').addEventListener('click',()=>{if(!window.confirm('Delete all demo complaint records saved in this browser?'))return;cases={};try{localStorage.removeItem(KEY)}catch{}notify('Demo records cleared')});
render(menu());
