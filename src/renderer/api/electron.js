import {
  ipcRenderer,
  shell,
  clipboard,
  remote,
} from 'electron'

import Router from '@/router'

const { dialog, Menu, MenuItem, BrowserWindow, getCurrentWindow } = remote

// 设置菜单
export const setApplicationMenu = () => {
  const menu = [
    {
      label: '文件',
      submenu: [
        {
          label: '新连接',
          click() {
            Router.push({ name: 'login' })
          },
        },
      ]
    },
    {
      label: ' 编辑',
      submenu: [
        {
          label: '复制',
          role: 'copy'
        },
        {
          label: '粘贴',
          role: 'paste'
        },
        {
          label: '剪切',
          role: 'cut'
        },
      ]
    },
    {
      label: '查看',
      submenu: [
        {
          label: '刷新',
          role: 'reload'
        },
      ]
    },
    {
      label: '帮助',
      role: 'help',
      submenu: [
        {
          label: '切换开发人员工具',
          role: 'toggledevtools'
        },
        {
          label: '报告一个问题',
          click() { shell.openExternal('https://github.com/aniiantt/updrive/issues') }
        },
        {
          type: 'separator'
        },
        {
          label: '关于',
          click() { }
        },
      ]
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
}

export const writeText = clipboard.writeText

// 打开外部链接
export const openExternal = shell.openExternal

export const windowOpen = (url, frameName, features) => {
  let child = new BrowserWindow({ parent: getCurrentWindow(), modal: true, show: false })
  child.loadURL(url)
  child.once('ready-to-show', () => {
    child.show()
  })
}

// 创建右键菜单
export const createContextmenu = ({ appendItems } = {}) => {
  const menu = new Menu()
  for (const menuItem of appendItems) {
    if (!menuItem.hide) menu.append(new MenuItem(menuItem))
  }
  return menu
}

// 显示右键菜单
export const showContextmenu = (items, opts = {}) => {
  const menu = createContextmenu(items)
  setTimeout(() => menu.popup(getCurrentWindow()))
}

// 监听 Ctrl + A
export const listenSelectAll = callback => ipcRenderer.on('SHORTCUT_SELECT_ALL', callback)

// 上传文件
export const uploadFileDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      getCurrentWindow(),
      {
        title: '选择要上传的文件',
        buttonLabel: '上传',
        properties: ['openFile', 'multiSelections'],
        ...option,
      },
      resolve,
    )
  })
}

// 上传文件夹
export const uploadDirectoryDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      getCurrentWindow(),
      {
        title: '选择要上传的文件夹',
        buttonLabel: '上传',
        properties: ['openDirectory', 'createDirectory', 'multiSelections', 'showHiddenFiles'],
        ...option,
      },
      resolve,
    )
  })
}

// 下载
export const downloadFileDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      getCurrentWindow(),
      {
        title: '下载到',
        buttonLabel: '保存',
        properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
        ...option,
      },
      folderPaths => {
        resolve(folderPaths && folderPaths[0])
      },
    )
  })
}

// messgae
export const messgaeDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showMessageBox(
      getCurrentWindow(),
      {
        buttons: [],
        cancelId: -1,
        noLink: true,
        ...option,
      },
      resolve,
    )
  })
}
