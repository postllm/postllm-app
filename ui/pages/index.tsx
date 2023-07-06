import { FC } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export const IndexPage: FC = () => {
	return (
		<Layout>
			<div>Hello main (new update!)</div>
			<Link to="/popup">Go to popup</Link>
			<Link to="/playground">Go to playground</Link>
		</Layout>
	);
};

