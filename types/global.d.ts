declare module "*.art" {
  const tpl: (optons?: any) => string;
  export default tpl;
}
declare module "*.png" {
  const image: string;
  export default image;
}
