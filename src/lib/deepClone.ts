/* eslint-disable @typescript-eslint/no-explicit-any */
const deepClone = (object: any) => JSON.parse(JSON.stringify(object));
export default deepClone;
