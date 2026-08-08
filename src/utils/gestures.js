export function countFingers(hand){
let count=0;
if(hand[8].y < hand[6].y) count++;
if(hand[12].y < hand[10].y) count++;
if(hand[16].y < hand[14].y) count++;
if(hand[20].y < hand[18].y) count++;
return count;
}