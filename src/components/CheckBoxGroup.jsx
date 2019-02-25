import React from 'react';
import CheckBox from './CheckBox';

export const CheckBoxGroup = props => {
	return (
		<ul>
			{
				props.items.map((item) => {
					return (<li key={item.value}><CheckBox name={props.name} {...item} handleChange={props.handleChange}/></li>)
				})
			}
		</ul>
    )
}

export default CheckBoxGroup