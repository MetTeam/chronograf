import React, {Component, CSSProperties, Fragment} from 'react'
import classnames from 'classnames'
import uuid from 'uuid'
import _ from 'lodash'

import {ClickOutside} from 'src/shared/components/ClickOutside'
import {
  ComponentColor,
  ComponentSize,
  IconFont,
  DropdownMenuColor,
} from 'src/reusable_ui/types'
import DropdownButton from 'src/reusable_ui/components/dropdowns/DropdownButton'
import FancyScrollbar from 'src/shared/components/FancyScrollbar'
import {ErrorHandling} from 'src/shared/decorators/errors'
import './Dropdown.scss'

interface Props {
  children: Array<JSX.Element | JSX.Element[]>
  onChange: (value: any) => void
  selectedItem: string
  color?: ComponentColor
  menuColor?: DropdownMenuColor
  size?: ComponentSize
  disabled?: boolean
  width?: number
  icon?: IconFont
  wrapText?: boolean
  customClass?: string
  maxMenuHeight?: number
}

interface State {
  expanded: boolean
}

@ErrorHandling
class Dropdown extends Component<Props, State> {
  public static defaultProps = {
    color: ComponentColor.Default,
    size: ComponentSize.Small,
    disabled: false,
    width: 120,
    wrapText: false,
    maxMenuHeight: 250,
    menuColor: DropdownMenuColor.Sapphire,
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      expanded: false,
    }
  }

  public render() {
    const width = `${this.props.width}px`

    return (
      <ClickOutside onClickOutside={this.collapseMenu}>
        <div className={this.containerClassName} style={{width}}>
          {this.button}
          {this.menu}
        </div>
      </ClickOutside>
    )
  }

  private toggleMenu = (): void => {
    this.setState({expanded: !this.state.expanded})
  }

  private collapseMenu = (): void => {
    this.setState({expanded: false})
  }

  private get containerClassName(): string {
    const {color, size, disabled, wrapText, customClass} = this.props

    return classnames(`dropdown dropdown-${size} dropdown-${color}`, {
      disabled,
      'dropdown-wrap': wrapText,
      [customClass]: customClass,
    })
  }

  private get button(): JSX.Element {
    const {selectedItem, disabled, color, size, icon} = this.props
    const {expanded} = this.state

    return (
      <DropdownButton
        label={selectedItem}
        active={expanded}
        color={color}
        size={size}
        icon={icon}
        disabled={disabled}
        onClick={this.toggleMenu}
      />
    )
  }

  private get menu(): JSX.Element {
    const {selectedItem, maxMenuHeight, menuColor} = this.props
    const {expanded} = this.state

    if (expanded) {
      return (
        <div
          className={`dropdown--menu-container dropdown--${menuColor}`}
          style={this.menuStyle}
        >
          <FancyScrollbar
            autoHide={false}
            autoHeight={true}
            maxHeight={maxMenuHeight}
          >
            <div className="dropdown--menu">
              {this.flatChildren.map((child: JSX.Element) =>
                React.cloneElement(child, {
                  ...child.props,
                  key: uuid.v4(),
                  selected: child.props.text === selectedItem,
                  onClick: this.handleItemClick,
                })
              )}
            </div>
          </FancyScrollbar>
        </div>
      )
    }

    return null
  }

  private get flatChildren() {
    const children = React.Children.toArray(this.props.children)

    const childrenWithoutFragments = children.map((child: JSX.Element) => {
      if (child.type === Fragment) {
        const childArray = React.Children.toArray(child.props.children)
        return childArray
      }

      return child
    })

    return _.flattenDeep(childrenWithoutFragments)
  }

  private get menuStyle(): CSSProperties {
    const {wrapText, width} = this.props

    if (wrapText) {
      return {
        width: `${width}px`,
      }
    }

    return {
      minWidth: `${width}px`,
    }
  }

  private handleItemClick = (value: any) => {
    const {onChange} = this.props
    onChange(value)
    this.collapseMenu()
  }
}

export default Dropdown