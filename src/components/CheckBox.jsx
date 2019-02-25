import React from 'react'

export const CheckBox = props => {
	let id = props.name+"_"+props.value;
    return (
      <div>
       <input id={id} name={props.name} onChange={props.handleChange} type="checkbox" checked={props.isChecked} value={props.value} />
	   <label htmlFor={id}>{props.label}</label>
      </div>
    )
}

export default CheckBox