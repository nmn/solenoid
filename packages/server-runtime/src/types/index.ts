export class Element<C extends Component | string = Component | string> {
	type: C;
	props: Record<string, any>;
	children: ReadonlyArray<Element> | undefined;
	constructor(
		type: C,
		props: Record<string, any>,
		children: ReadonlyArray<Element> | undefined,
	) {
		this.type = type;
		this.props = props;
		this.children = children;
	}
}

export type Component<Props extends {} = Record<string, any>> = (
	props: Props,
) => Element;
