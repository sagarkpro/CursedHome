import { useState } from "react";
import { tools as allTools } from "../constants/ToolDataConstants";
import type { ToolData } from "../models/ToolData";
import GetToolByTitle from "./tools/GetToolByTitle";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SiteComponent from "./SiteComponent";

export default function ToolsWrapper({ tools = allTools }: { tools?: ToolData[] }) {
	const [visible, setVisible] = useState<boolean>(false);
	const [selectedToolName, setSelectedToolName] = useState<string>("");

	function selectTool(tool: string) {
		setSelectedToolName(tool);
		setVisible(true);
	}

	return (
		<>
			{tools.map((toolData) => (
				<div key={`tool-${toolData.Title}`} className="m-4">
					<SiteComponent siteData={toolData} onClick={() => selectTool(toolData.Title)} />
				</div>
			))}
			<Dialog open={visible} onOpenChange={setVisible}>
				<DialogContent className="min-w-[50vw] p-8">
					<div className="flex w-full justify-center items-center">
						<GetToolByTitle title={selectedToolName} />
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
