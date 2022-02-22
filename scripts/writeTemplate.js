const artTemplate = require("art-template");
const fs = require("fs");
const path = require("path");

const { pckReg } = require("./utils");

const fullName = process.argv[2];

const matchArr = fullName.match(pckReg);

let isPackageRootExit = true;

if (!matchArr) {
  console.log(`${fullName} 包名不符合格式`);
  return;
}
console.log(matchArr);

const rootDirName = matchArr[1];
const componentName = matchArr[2];

const packageRoot = path.resolve(__dirname, `../packages/${rootDirName}`);

// 判断根目录文件名是否存在
if (!fs.existsSync(packageRoot)) {
  isPackageRootExit = false;
  fs.mkdirSync(packageRoot);
}

function toHump(name) {
  const reg = /-(\w)/g;
  if (name.match(reg)) {
    name = name.replace(reg, function (all, letter) {
      return letter.toUpperCase();
    });
  }
  name = name.replace(/^(\w)/, function (all, letter) {
    return letter.toUpperCase();
  });
  return name;
}

// 检查有没有输入组件名
if (!componentName) {
  console.log("请输入组件名");
  return;
}

const componentPath = path.resolve(packageRoot, componentName);

// 检查输入的组件名是否已经存在了
if (fs.existsSync(componentPath)) {
  console.log(`${componentName}组件已经存在了`);
  return;
}

function getTplFiles(fileDir) {
  const fileArr = [];
  const fileList = fs.readdirSync(fileDir);
  for (let i = 0; i < fileList.length; i++) {
    const fullPath = path.resolve(fileDir, fileList[i]);
    const status = fs.statSync(fullPath);
    if (status.isDirectory()) {
      fileArr.push(...getTplFiles(fullPath));
    } else {
      fileArr.push(fullPath);
    }
  }
  return fileArr;
}

function getCompFiles(tplSrc, fileDir) {
  return path.join(componentPath, tplSrc.replace(fileDir, ""));
}

function makeDir(dir) {
  if (fs.existsSync(dir)) return true;
  if (makeDir(path.dirname(dir))) {
    fs.mkdirSync(dir);
    return true;
  }
}

function writeTpl() {
  const fileDir = path.resolve(__dirname, "./template");
  const tplList = getTplFiles(fileDir);
  const params = {
    name: componentName,
    importName: toHump(componentName),
    fullName
  };

  tplList.forEach((tplSrc) => {
    const result = artTemplate(tplSrc, params);
    let compSrc = getCompFiles(tplSrc, fileDir);
    compSrc = compSrc.replace(".art", "");
    makeDir(path.dirname(compSrc));
    fs.writeFileSync(compSrc, result);
  });
  editTsconfig();
  console.log(`${componentName}模板创建成功`);
}

function editTsconfig() {
  if (isPackageRootExit) {
    return;
  }
  const tsconfigPath = path.resolve(__dirname, "../tsconfig.json");
  const tsconfig = require(tsconfigPath);
  tsconfig.compilerOptions.paths[`@${rootDirName}/*`] = [
    `packages/${rootDirName}/*`
  ];
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
}

writeTpl();
