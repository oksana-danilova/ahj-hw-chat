export default function getCreationDate() {
  const date = new Date();
  let dateHours = date.getHours();
  let dateMinutes = date.getMinutes();
  let dateDay = date.getDate();
  let dateMonth = date.getMonth() + 1;
  if (dateHours < 10) {
    dateHours = `0${dateHours}`;
  }
  if (dateMinutes < 10) {
    dateMinutes = `0${dateMinutes}`;
  }
  if (dateDay < 10) {
    dateDay = `0${dateDay}`;
  }
  if (dateMonth < 10) {
    dateMonth = `0${dateMonth}`;
  }
  return `${dateHours}:${dateMinutes} ${dateDay}.${dateMonth}.${date.getFullYear()}`;
}
