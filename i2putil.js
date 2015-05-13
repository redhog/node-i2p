exports.strToTitle = function(s) {
  s = s.toLowerCase();
  return s.slice(0,1).toUpperCase() + s.slice(1);
}

exports.copyObj = function(src, dst) {
  if (dst == undefined) dst = {};
  for (var key in src) {
    dst[key] = src[key];
  };
  return dst;
}