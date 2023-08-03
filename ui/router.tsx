import { FC } from "react";
import {
	HashRouter,
	Navigate,
	Route,
	Routes,
	useParams,
} from "react-router-dom";
import { DashboardPage } from "./pages/dashboard";
import { GridPage } from "./pages/grid";
import { PlaygroundPage } from "./pages/playground";

const NotFound = () => {
	const params = useParams();
	return <div>Not found</div>;
};

export const Router: FC = () => {
	return (
		<HashRouter>
			<Routes>
				<Route>
					<Route
						path="*"
						element={
							<Navigate to="/workspaces/1/dashboard/1" replace />
						}
					/>
					<Route
						path="workspaces/:workspaceId/dashboard/:collectionId"
						element={<DashboardPage />}
					></Route>
					<Route
						path="workspaces/:workspaceId/dashboard/:collectionId/grids/:gridId"
						element={<GridPage />}
					/>
					<Route
						path="workspaces/:workspaceId/dashboard/:collectionId/templates/:templateId/:versionId?/:chatId?"
						element={<PlaygroundPage />}
					/>
				</Route>
			</Routes>
		</HashRouter>
	);
};

