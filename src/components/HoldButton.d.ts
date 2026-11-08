import type {ReactNode} from 'react';
export type HoldButtonProps={children?:ReactNode;doneLabel?:ReactNode;icon?:ReactNode;doneIcon?:ReactNode;label?:string;backgroundColor?:string;fillColor?:string;textColor?:string;fillTextColor?:string;size?:'sm'|'md'|'lg';radius?:number;fillDirection?:'right'|'up';holdTime?:number;releaseTime?:number;pressScale?:number;wave?:boolean;waveAmplitude?:number;glow?:boolean;resetAfter?:number;disabled?:boolean;onHold?:()=>void;onTap?:()=>void;className?:string};
export default function HoldButton(props:HoldButtonProps):ReactNode;
