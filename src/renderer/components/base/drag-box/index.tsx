/*
 * @Date: 2022-08-02 16:36:36
 * @Description: 拖动容器
 */
import React, { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from "react"
import classNames from 'classnames'
import { Icon } from '@/components'
import { actions, dispatch } from "@/store"
import { $ipc } from '@/utils'
import config from '@config/index'
import styles from './index.module.scss'

// 关于窗口拖拽的一些临时变量
let flag = 0  // 确定该图层是否鼠标处于按下状态
let startFalg = 0 // 正在移动时的标识
let screenX = null // 鼠标按下时的坐标
let screenY = null // 鼠标按下时的坐标

interface IDragBoxProps {
  /** 隐藏窗口右上角按钮区 */
  hideControlBar: boolean
  /** 子元素 */
  children?: ReactNode // 子元素只要包含了no-drag类名，表示当前节点不可以被拖动
  /** 自定义样式 */
  style?: CSSProperties
      /** 自定义类名 */
  className?: string,
}
// 拖动容器
const DragBox = (props: IDragBoxProps) => {
  const { children, style: _style, className:_className, hideControlBar } = props
  // 窗口最大化（取出配置项，作为默认值）
  const [winMax, setWinMax] = useState<boolean>(config.IsMaximize)
  // 主进程通信
  const ipcBrowserChange = async (event: string) => {
    await $ipc.invoke(event)
  }

  useEffect(() => {
    // 接受F11快捷键消息
    $ipc.on('shortcutKeyEleven', (event, args) => {
      setWinMax(args)
    })
  }, [])

  useEffect(() => {
    // 把当前窗口状态存起来
    dispatch(actions.configActions.setMaximize(winMax))
  }, [winMax])

  // 双击时
  const headDoubleClick = (e) => {
    // 是否span（图标）标签
    const isSpan = e?.target?.nodeName == 'SPAN'
    // 是否带有no-drag类名
    const isnoDrag = e?.target?.className?.indexOf('no-drag') !== -1
    if (isSpan || isnoDrag) {
      return
    }
    // 如果双击到了非功能的盒子，就实现窗口最大化，最小化
    ipcBrowserChange(winMax ? 'window-mix' : 'window-max')
    setWinMax(!winMax)
  }

  // 鼠标按键被按下
  const onMouseDown = (e: any) => {
    // 不是鼠标左键直接返回
    if (e.button !== 0) return
    // 是否span（图标）标签
    const isSpan = e?.target?.nodeName == 'SPAN'
    // 是否带有no-drag类名
    const isnoDrag = e?.target?.className?.indexOf('no-drag') !== -1
    if (isSpan || isnoDrag) {
      return
    }
    // 如果是最大窗口，再去拖动，那么久不能拖动，直接吧取消最大化窗口
    if (winMax) {
      startFalg = null
      flag = 1 // 标识鼠标被按下
      screenX = e.screenX
      screenY = e.screenY
    } else {
      // 不是最大化时，移动窗口
      $ipc.send('main-window-move', {canMoving: true})
    }
  }

  // 鼠标移动时
  const onMousemove = async (e: any) => {
    // 鼠标被按下，且窗口最大化时，如果出现用户拖动行为，直接吧窗口取消最大化
    // startFalg防止移动时重复执行下面的方法
    if (flag && winMax && !startFalg) {
      // 如果按下去的位置不等于移动的位置，代表用户想最大化窗口变化-》》》取消最大化
      if (screenX !== e.screenX || screenY !== e.screenY) {
        startFalg = 1 // 标识下表示已经存在移动了，不能重复执行
        // 给窗口取消最大化
        await ipcBrowserChange('window-mix')
        // 跟随鼠标移动
        $ipc.send('main-window-move', { canMoving: true, mixFlag: true })
        // 更改窗口状态
        setWinMax(false)
      }
    }
  }

  // 鼠标按键被松开时发生 || 右键停止鼠标跟随，防止意外
  const channel = (e: any) => {
    flag = null
    startFalg = null
    $ipc.send('main-window-move', {canMoving: false})
  }

  return (
    <div
      style={_style}
      className={classNames(styles.dragBox, _className, 'unselectable')}
      onMouseDown={ onMouseDown }
      onMouseMove={ onMousemove }
      onContextMenu= { channel }
      onMouseUp={ channel }
      onDoubleClick={headDoubleClick}>
      <>
        {children}
      </>
      {/* 功能区 */}
      {
        !hideControlBar &&
        <div className={styles.browserRibbon}>
          <div className={classNames(styles.itemBtn ,'no-drag')} onClick={() => ipcBrowserChange('windows-mini')}>
            <Icon type="yp-zuixiaohua" size={18}/>
          </div>
          <div className={classNames(styles.itemBtn ,'no-drag')}
            onClick={() => {
              ipcBrowserChange(winMax ? 'window-mix' : 'window-max')
              setWinMax(!winMax)
            }}>
            <Icon type={winMax ? 'yp-zuidahua' : 'yp-zuidahua1'} size={18}/>
          </div>
          <div className={classNames(styles.itemBtn ,'no-drag')} onClick={() => ipcBrowserChange('open-tray')}>
            <Icon type="yp-close" size={18}/>
          </div>
        </div>
      }
    </div>
  )
}

DragBox.defaultProps = {
  hideControlBar: false,
}

export default DragBox