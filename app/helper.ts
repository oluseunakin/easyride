export const usSorted = (
  toSort: any,
  minLat: number,
  maxLat: number,
  minLong: number,
  maxLong: number
) => {
  const temp: { index: number; total: number }[] = toSort.map(
    (ad: any, i: number) => {
      const isCloserToMinLat = ad.lat - minLat < maxLat - ad.lat;
      const isCloserToMinLong = ad.long - minLong < maxLong - ad.long;
      let total = 0;
      if (isCloserToMinLat) {
        const diff = ad.lat - minLat;
        total += diff;
      } else {
        const diff = maxLat - ad.lat;
        total += diff;
      }
      if (isCloserToMinLong) {
        const diff = ad.long - minLong;
        total += diff;
      } else {
        const diff = maxLong - ad.long;
        total += diff;
      }
      return { index: i, total };
    }
  );
  const sortedTemp = temp.sort((a, b) => a.total - b.total);
  return sortedTemp.map((st) => st.index).map((sti) => toSort[sti]);
};

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