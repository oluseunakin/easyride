export const dateFormatter = (month: number) => {
  if(month == 0) return "Jan"
  else if(month == 1) return "Feb"
  else if(month == 2) return "Mar"
  else if(month == 3) return "Apr"
  else if(month == 4) return "May"
  else if(month == 5) return "Jun"
  else if(month == 6) return "Jul"
  else if(month == 7) return "Aug"
  else if(month == 8) return "Sep"
  else if(month == 9) return "Oct"
  else if(month == 10) return "Nov"
  else return "Dec"
}

export const hashParties = (userId: string) => {
  let hashed = 0
  for(let p of userId) hashed += p.charCodeAt(0)
  return hashed
}