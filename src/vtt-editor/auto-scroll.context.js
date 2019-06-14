import * as React from 'react';
import * as PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';

const AutoScrollContext = React.createContext({});

const useStyles = makeStyles({
	root: {
		position: 'relative',
		height: '100%',
		width: '100%',
	},
	inner: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		overflowY: 'scroll',
		scrollBehavior: 'smooth',
	},
});

AutoScrollProvider.propTypes = {
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};

export function AutoScrollProvider({ children, className }) {
	const [scrollContainerRef, setScrollContainerRef] = React.useState();
	const classes = useStyles();

	return (
		<AutoScrollContext.Provider
			value={React.useMemo(
				() => ({
					scrollToChild: el => {
						scrollContainerRef.scrollTop = el.offsetTop;
					},
				}),
				[scrollContainerRef]
			)}>
			<div className={clsx(className, classes.root)}>
				<div className={classes.inner} ref={setScrollContainerRef}>
					{children}
				</div>
			</div>
		</AutoScrollContext.Provider>
	);
}

export function useAutoScroll() {
	return React.useContext(AutoScrollContext);
}
