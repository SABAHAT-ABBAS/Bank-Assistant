export const CATEGORIES = [
  {id:'failed',label:'Failed transaction'},
  {id:'deduction',label:'Incorrect deduction'},
  {id:'transfer',label:'Wrong transfer'},
  {id:'other',label:'Other transaction issue'}
];
export const ACTIONS = [
  {id:'report',label:'File a complaint',icon:'+'},
  {id:'track',label:'Track complaint',icon:'#'},
  {id:'refund',label:'Refund guidance',icon:'↻'},
  {id:'transaction',label:'Transaction help',icon:'?'},
  {id:'human',label:'Human support',icon:'☏'}
];
export const SAMPLE = {'BA-100001':{id:'BA-100001',type:'failed',amount:2500,date:'2026-10-01',description:'Payment failed but money was deducted.',status:'Under review',createdAt:'2026-10-02T09:00:00.000Z',sample:true}};
export const fresh = () => ({mode:'menu',step:'',draft:{},history:[],ended:false});
export const clone = x => JSON.parse(JSON.stringify(x));
export const normalize = value => String(value||'').trim().toLowerCase();
export const looksSensitive = value => /\b(?:\d[ -]?){12,19}\b/.test(value)||/\b(?:otp|pin|password|cvv)\s*[:=]\s*\S+/i.test(value);
export function classify(text) {
  const s=normalize(text);
  const rules=[
    ['report',/\b(report|complaint|complain|dispute|deducted|deduction|charged twice|wrong transfer)\b/],
    ['track',/\b(track|status|progress|reference id|case id)\b/],
    ['refund',/\b(refund|reversal|reverse|money back|how long)\b/],
    ['transaction',/\b(transaction help|failed payment|transfer help|payment issue|transaction information)\b/],
    ['human',/\b(human|agent|representative|person|contact support|call support)\b/]
  ];
  return rules.filter(([,re])=>re.test(s)).map(([id])=>id);
}
function response(state,messages,choices=[],effect=null){return {state,messages:Array.isArray(messages)?messages:[messages],choices,effect};}
const choices = (...items) => items.map(([label,value])=>({label,value}));
const topChoices=()=>ACTIONS.map(a=>({label:a.label,value:a.id}));
const cancelChoices=()=>choices(['Main menu','menu'],['Cancel','cancel']);
function start(state,id){
  const next={...clone(state),mode:id,step:'',draft:{},ended:false};
  if(id==='report'){next.step='category';return response(next,'I can help you prepare a demo transaction complaint. What type of issue occurred?',CATEGORIES.map(c=>({label:c.label,value:c.id})).concat([{label:'Cancel',value:'cancel'}]));}
  if(id==='track'){next.step='case';return response(next,'Enter your complaint reference, such as BA-100001. You may try the sample case.',choices(['Use sample case','BA-100001'],['Main menu','menu']));}
  if(id==='refund')return response(next,'Refunds depend on the bank, payment method and investigation. Check the transaction status, keep your reference number and report an unresolved deduction through the official bank channel. This demo cannot issue refunds or predict timelines.',choices(['File complaint','report'],['Track case','track'],['Main menu','menu']));
  if(id==='transaction')return response(next,'For a failed or pending payment, check your statement and reference first. For a transfer to the wrong recipient, contact your real bank immediately. Never enter a card number, PIN, OTP or password into this demo.',choices(['Report issue','report'],['Refund guidance','refund'],['Human support','human']));
  if(id==='human')return response(next,'This is a university demonstration; no live agent is connected. For real issues, use the verified phone number on your bank card or official banking app. If fraud is suspected, contact your bank urgently.',choices(['Main menu','menu'],['File complaint','report']));
  return menu();
}
export function menu(){return response(fresh(),'Welcome! I’m BankAssist, a simulated banking support assistant. I can help you file or track a demo complaint, understand refund steps, get transaction guidance, or find human support. What would you like to do?',topChoices());}
export function transition(previous,input,cases={},today=new Date()){
  const text=String(input||'').trim(),s=normalize(text);
  if(!text)return response(previous,'Please type a message or select an option.',topChoices());
  if(['menu','home','main menu'].includes(s))return menu();
  if(['restart','start over','new conversation'].includes(s))return menu();
  if(['exit','quit'].includes(s))return response({...fresh(),ended:true,mode:'ended'},'Conversation ended. Choose Restart when you need help again.',choices(['Restart','restart']));
  if(['undo','back'].includes(s)){
    if(!previous.history.length)return response(previous,'There is no previous form step to undo. You can return to the main menu.',choices(['Main menu','menu']));
    const history=clone(previous.history),prior=history.pop();return resume({...prior,history},'Previous step restored. You can change your answer.');
  }
  if(s==='cancel'&&previous.mode==='report')return response(fresh(),'Your draft has been discarded. No complaint was submitted.',topChoices());
  if(previous.mode==='menu'||previous.mode==='ended'){
    if(ACTIONS.some(a=>a.id===s))return start(previous,s);
    const found=classify(text);
    if(found.length===1)return start(previous,found[0]);
    if(found.length>1)return response(previous,'I noticed more than one request. Which task should we handle first?',found.map(id=>({label:ACTIONS.find(a=>a.id===id).label,value:id})));
    return response(previous,'I didn’t recognize that request. Choose a supported task below or type “help”.',topChoices());
  }
  if(ACTIONS.some(a=>a.id===s))return start(previous,s);
  if(s==='help')return resume(previous,'Here is what you can do at this step.');
  if(previous.mode==='report')return reportStep(previous,text,today);
  if(previous.mode==='track'){
    const id=text.toUpperCase().replace(/\s/g,'');
    if(!/^BA-\d{6}$/.test(id))return response(previous,'Please enter an ID in the format BA-123456.',choices(['Try sample case','BA-100001'],['Main menu','menu']));
    const found=cases[id]||SAMPLE[id];
    if(!found)return response(previous,'I couldn’t find that reference in this browser’s demo records. Check the ID or start a new complaint.',choices(['Try sample case','BA-100001'],['File complaint','report'],['Main menu','menu']));
    return response(previous,'Complaint '+id+'\nStatus: '+found.status+'\nIssue: '+(CATEGORIES.find(c=>c.id===found.type)?.label||'Transaction issue')+'\nAmount: PKR '+Number(found.amount).toLocaleString('en-PK')+'\nThis is a simulated record, not a bank status.',choices(['Track another case','track'],['Main menu','menu']));
  }
  return resume(previous,'Choose a related action or return to the main menu.');
}
function resume(st,message){
  const buttons=st.mode==='report' ? (
    st.step==='category'?CATEGORIES.map(c=>({label:c.label,value:c.id})):
    st.step==='confirm'?choices(['Submit complaint','confirm'],['Edit previous answer','back'],['Cancel','cancel']):
    choices(['Back','back'],['Cancel','cancel'])
  ): st.mode==='track'?choices(['Sample ID','BA-100001'],['Main menu','menu']):topChoices();
  const prompt=st.mode==='report'?{
    category:'Select the type of transaction issue.',
    amount:'Enter the amount in PKR, e.g. 2500.',
    date:'Enter the transaction date as YYYY-MM-DD.',
    description:'Describe the problem briefly, without sensitive account details.',
    confirm:'Review your details and choose Submit complaint to confirm.'
  }[st.step]:'';
  return response(st,[message,prompt].filter(Boolean),buttons);
}
function reportStep(prev,text,today){
  const next=clone(prev),s=normalize(text),save=()=>next.history.push({mode:prev.mode,step:prev.step,draft:clone(prev.draft),ended:false});
  if(prev.step==='category'){
    if(!CATEGORIES.some(c=>c.id===s))return response(prev,'Please choose one of the listed issue categories.',CATEGORIES.map(c=>({label:c.label,value:c.id})));
    save();next.draft.type=s;next.step='amount';return response(next,'How much money was involved? Enter an amount in PKR (for example 2500).',cancelChoices());
  }
  if(prev.step==='amount'){
    const cleaned=text.replace(/,/g,'');const amount=Number(cleaned);
    if(!/^\d+(\.\d{1,2})?$/.test(cleaned)||!Number.isFinite(amount)||amount<=0||amount>10000000)return response(prev,'Enter a valid positive amount up to PKR 10,000,000 (for example 2500 or 2500.50).',choices(['Back','back'],['Cancel','cancel']));
    save();next.draft.amount=amount;next.step='date';return response(next,'Enter the transaction date using YYYY-MM-DD, e.g. 2026-10-01.',choices(['Back','back'],['Cancel','cancel']));
  }
  if(prev.step==='date'){
    const d=/^\d{4}-\d{2}-\d{2}$/.test(text)?new Date(text+'T00:00:00Z'):null;
    if(!d||Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==text||d.getTime()>today.getTime())return response(prev,'That date is invalid or in the future. Use YYYY-MM-DD for a real past or current date.',choices(['Back','back'],['Cancel','cancel']));
    save();next.draft.date=text;next.step='description';return response(next,'Describe the problem in 8–280 characters. Do not enter an OTP, PIN, card number, or password.',choices(['Back','back'],['Cancel','cancel']));
  }
  if(prev.step==='description'){
    if(text.length<8||text.length>280)return response(prev,'Please give a brief explanation between 8 and 280 characters.',choices(['Back','back'],['Cancel','cancel']));
    if(looksSensitive(text))return response(prev,'That looks like sensitive banking information. Please remove card numbers, PINs, OTPs and passwords before continuing.',choices(['Back','back'],['Cancel','cancel']));
    save();next.draft.description=text;next.step='confirm';return response(next,'Review your demo complaint:\nIssue: '+CATEGORIES.find(c=>c.id===next.draft.type).label+'\nAmount: PKR '+next.draft.amount.toLocaleString('en-PK')+'\nDate: '+next.draft.date+'\nDescription: '+next.draft.description+'\n\nNothing has been submitted yet. Submit this complaint?',choices(['Submit complaint','confirm'],['Edit previous answer','back'],['Cancel','cancel']));
  }
  if(prev.step==='confirm'){
    if(s!=='confirm')return response(prev,'Please choose Submit complaint, Edit previous answer, or Cancel.',choices(['Submit complaint','confirm'],['Edit previous answer','back'],['Cancel','cancel']));
    const id='BA-'+String(Math.floor(100000+Math.random()*900000));
    const record={...prev.draft,id,status:'Received',createdAt:today.toISOString()};
    return response({...fresh(),mode:'completed'},'Your DEMO complaint was saved in this browser.\nReference: '+id+'\nStatus: Received\nSave this ID to track it. No real bank has been contacted.',choices(['Track complaint','track'],['New complaint','report'],['Main menu','menu']),{kind:'save',record});
  }
  return menu();
}
