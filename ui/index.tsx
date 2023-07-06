import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import { Router } from "./router";
import { queryClient, trpc, trpcClient } from "./utils/trpc";

import "react-toastify/dist/ReactToastify.css";
import "./styles/index.css";
import "./styles/radix-select.css";
import "./styles/tailwind.css";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

root.render(
	<React.StrictMode>
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<div className="h-full dark:bg-gray-900">
					<ToastContainer position="bottom-right" autoClose={2500} />
					<Router />
				</div>
			</QueryClientProvider>
		</trpc.Provider>
	</React.StrictMode>,
);

postMessage({ payload: "removeLoading" }, "*");

