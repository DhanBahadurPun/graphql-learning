const randomString = () => {
  return Math.random()
    .toString(36)
    .slice(-8);
};

const makeid = () => {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i <= 4; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

const nepaliCurrency = x => {
  if (x === null) {
    x = 0;
  }
  x = x.toString();
  var afterPoint = "";
  if (x.indexOf(".") > 0) afterPoint = x.substring(x.indexOf("."), x.length);
  x = Math.floor(x);
  x = x.toString();
  var lastThree = x.substring(x.length - 3);
  var otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers != "") lastThree = "," + lastThree;
  var res =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
  return res;
};

module.exports = { randomString, nepaliCurrency, makeid };
