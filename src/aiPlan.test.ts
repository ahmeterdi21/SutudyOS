import {describe,it,expect} from 'vitest';
import {parsePlan,validatePlan,planDates,type PlanInput} from './aiPlan';
const input:PlanInput={topic:'Türev',goal:'Tekrar',startDate:'2026-12-31',days:2,dailyMinutes:90};
const task={title:'Zincir kuralı',topic:'Türev',notes:'20 soru çöz.',date:'2026-12-31',durationMinutes:45};
describe('assistant plan validation',()=>{
 it('handles date boundaries in local calendar',()=>expect(planDates(input)).toEqual(['2026-12-31','2027-01-01']));
 it('accepts bounded tasks but discards provider ids and completion flags',()=>{
  const plan=parsePlan('```json\n'+JSON.stringify({summary:'Plan',tasks:[{...task,id:'remote',done:true,lesson:'other'}]})+'\n```',input);
  expect(plan.tasks[0]).toEqual(task);
 });
 it('rejects dates outside the requested period and invalid dates',()=>{
  expect(()=>validatePlan({summary:'x',tasks:[{...task,date:'2027-01-02'}]},input)).toThrow();
  expect(()=>planDates({...input,startDate:'2026-02-30'})).toThrow();
 });
 it('rejects daily overload, fractions and missing task fields',()=>{
  expect(()=>validatePlan({summary:'x',tasks:[task,task,task]},input)).toThrow();
  expect(()=>validatePlan({summary:'x',tasks:[{...task,durationMinutes:1.5}]},input)).toThrow();
  expect(()=>validatePlan({summary:'x',tasks:[{...task,notes:null}]},input)).toThrow();
 });
 it('rejects empty or unbounded plans and malformed responses',()=>{
  expect(()=>parsePlan('not json',input)).toThrow();
  expect(()=>validatePlan({summary:'x',tasks:[]},input)).toThrow();
  expect(()=>validatePlan({summary:'x',tasks:Array(29).fill(task)},input)).toThrow();
 });
});
