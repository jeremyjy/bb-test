export function fileSize (size) {
  if (isNaN(size)) {
    return 0 + 'K'
  }
  let M = 1024
  if (size >= M) {
    return (size / M).toFixed(1) + 'M'
  } else {
    return size + 'K'
  }
}

export function duration (val) {
  if (isNaN(val)) {
    return 0
  }
  let M = 60
  let H = 3600
  let ss = Math.ceil(val % M)
  if (val >= H) {
    let mm = Math.floor((val % H) / M)
    return Math.floor(val / H) + ':' + (mm < 10 ? `0${mm}` : mm) + ':' + (ss < 10 ? `0${ss}` : ss)
  } else if (val >= M) {
    let mm = Math.floor(val / M)
    return (mm < 10 ? `0${mm}` : mm) + ':' + (ss < 10 ? `0${ss}` : ss)
  } else {
    return val + '\'\''
  }
}
