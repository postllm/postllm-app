import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";

type TSettingsModalProps = {
	open: boolean;
};

export const SettingsModal = ({ open }: TSettingsModalProps) => {
	const [show, setShow] = useState(open);
	const [tabIndex, setTabIndex] = useState(0);
	const { workspaceId, collectionId } = useParams();
	const { data: version } = trpc.config.version.useQuery();
	const { data: config } = trpc.config.get.useQuery();
	const { mutate: updateConfig } = trpc.config.update.useMutation();

	const onCreate = useCallback(async () => {
		setShow(false);
	}, []);

	return (
		<Dialog.Root open={show} onOpenChange={setShow}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0" />
				<Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] min-h-[75vh] w-[90vw] max-w-[850px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-zinc-800 text-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
					<Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
						PostLLM Preferences - v{version}
					</Dialog.Title>

					<Tabs onTabChange={setTabIndex} />

					{/* API Keys */}
					{tabIndex === 0 && <ApiKeysTab />}
					{tabIndex === 1 && <LicenseTab />}

					<Dialog.Close asChild>
						<button
							className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
							aria-label="Close"
						>
							<Cross2Icon />
						</button>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

const tabs = [{ name: "API Keys" }, { name: "License" }];

const Tabs = ({ onTabChange }: { onTabChange: (v: number) => void }) => {
	const [tabIndex, setTabIndex] = useState(0);

	useEffect(() => {
		onTabChange(tabIndex);
	}, [tabIndex]);

	return (
		<div className="mb-4">
			<div className="mx-auto max-w-7xl">
				<div className="block">
					<nav className="flex border-b border-white/10 py-4">
						<ul
							role="list"
							className="flex min-w-full flex-none gap-x-6 px-2 text-sm font-semibold leading-6 text-gray-400"
						>
							{tabs.map((tab, i) => (
								<li key={tab.name}>
									<button
										onClick={() => setTabIndex(i)}
										className={
											tabIndex === i
												? "text-emerald-400"
												: ""
										}
									>
										{tab.name}
									</button>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</div>
	);
};

const ApiKeysTab = () => {
	const { data: config } = trpc.config.get.useQuery();
	const { mutate: updateConfig } = trpc.config.update.useMutation();

	return (
		<>
			<div>
				<div>
					<label
						htmlFor="openai"
						className="block text-sm font-medium leading-6 text-white"
					>
						OpenAI API Key
					</label>
					<div className="mt-2">
						<input
							defaultValue={config?.apiKeys?.openAIKey ?? ""}
							type="text"
							name="openai"
							id="openai"
							className="block w-full px-2 rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
							aria-describedby="openai-description"
							onChange={(e) => {
								updateConfig({
									...config,
									apiKeys: {
										...config?.apiKeys,
										openAIKey: e.target.value,
									},
								});
							}}
						/>
					</div>
					<p className="mt-2 text-xs" id="openai-description">
						You can find your API key here{" "}
						<a
							target="_blank"
							className="hover:underline"
							href="https://platform.openai.com/account/api-keys"
						>
							https://platform.openai.com/account/api-keys
						</a>
					</p>
				</div>
				<div className="mt-2">
					<label
						htmlFor="openaihost"
						className="block text-sm font-medium leading-6 text-white"
					>
						OpenAI API Endpoint
					</label>
					<div className="mt-2">
						<input
							defaultValue={config?.apiKeys?.openAIEndpoint ?? ""}
							type="text"
							name="openaihost"
							id="openaihost"
							className="block w-full px-2 rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							placeholder="https://api.openai.com"
							aria-describedby="openai-description"
							onChange={(e) => {
								updateConfig({
									...config,
									apiKeys: {
										...config?.apiKeys,
										openAIEndpoint: e.target.value,
									},
								});
							}}
						/>
					</div>
					{config?.apiKeys?.openAIEndpoint ? (<p className="mt-2 text-xs" id="openai-description">
						Your API key and all messages will be sent to {config?.apiKeys?.openAIEndpoint}. Please confirm that you trust this address. Otherwise, your apiKey could be exposed.
					</p>) : null}
				</div>
			</div>
		</>
	);
};

const LicenseTab = () => {
	const { data: config } = trpc.config.get.useQuery();
	const utils = trpc.useContext();
	const { mutate: updateConfig } = trpc.config.update.useMutation();
	const { mutate: updateLicense } = trpc.config.updateLicense.useMutation();

	const onLicenseUpdate = useCallback(
		async (licenseKey: string) => {
			await updateLicense({ licenseKey });
			utils.config.get.invalidate();
		},
		[updateLicense],
	);

	return (
		<>
			<div>
				<div>
					<label
						htmlFor="license"
						className="block text-sm font-medium leading-6 text-white"
					>
						PostLLM license
					</label>
					<div className="mt-2">
						<input
							defaultValue={config?.licenseKey ?? ""}
							type="text"
							name="license"
							id="license"
							className="block w-full px-2 rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							placeholder="pllm-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
							aria-describedby="license-description"
							onChange={(e) => onLicenseUpdate(e.target.value)}
						/>
					</div>
					{config?.licenseKey && (
						<p className="mt-2 text-xs" id="license-description">
							Your license is{" "}
							<span className="font-semibold">
								{config?.licenseValid ? "valid" : "invalid"}
							</span>
						</p>
					)}
					{!config?.licenseKey && (
						<p className="mt-2 text-xs" id="openai-description">
							<a
								target="_blank"
								className="hover:underline"
								href="https://postllm.com?ref=app"
							>
								Get a license
							</a>
						</p>
					)}
				</div>
			</div>
		</>
	);
};

