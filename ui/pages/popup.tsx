import { FC } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export const PopupPage: FC = () => {
	return (
		<Layout>
			<div>Hello popuip</div>
			<Link to="/">Go back</Link>
		</Layout>
	);
};

