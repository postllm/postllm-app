import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { MainArea } from "../components/Playground/MainArea";
import { SideArea } from "../components/Playground/SideArea";
import { trpc } from "../utils/trpc";

export const PlaygroundPage = () => {
	const { workspaceId, collectionId, templateId, versionId } = useParams();
	const navigate = useNavigate();
	const { data: template } = trpc.templates.get.useQuery(
		{
			id: templateId as string,
		},
		{ enabled: !!templateId },
	);

	useEffect(() => {
		if (!template) return;
		if (versionId) return;

		const latestVersion = template.versions[0];
		const defaultVersion = template.versions.find((v) => v.default);
		if (defaultVersion || latestVersion) {
			navigate(
				`/workspaces/${workspaceId}/dashboard/${collectionId}/templates/${templateId}/${
					defaultVersion?._id || latestVersion._id
				}`,
			);
		} else {
			// Create and navigate
		}
	}, [template, navigate, versionId, workspaceId, collectionId, templateId]);

	return (
		<Layout>
			<div className="relative flex flex-row w-full">
				<MainArea />
				<SideArea />
			</div>
		</Layout>
	);
};

