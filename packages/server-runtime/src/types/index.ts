export type Element<C extends Component | string = Component | string> = {
	type: C;
	props: Record<string, any>;
	children: Element | ReadonlyArray<Element> | undefined;
};

export type Component<Props extends {} = Record<string, any>> = (
	props: Props,
) => Element;
