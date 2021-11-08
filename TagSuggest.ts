import {
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	getAllTags,
	TFile,
} from "obsidian";
import FrontmatterTagSuggestPlugin from "./main";

export default class TagSuggest extends EditorSuggest<string> {
	plugin: FrontmatterTagSuggestPlugin;
	tags: string[];

	constructor(plugin: FrontmatterTagSuggestPlugin) {
		super(plugin.app);
		this.plugin = plugin;
		this.tags = getAllTags(
			this.plugin.app.metadataCache.getFileCache(
				this.plugin.app.workspace.getActiveFile()
			)
		).map((p) => p.split("#").pop());
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		_: TFile
	): EditorSuggestTriggerInfo | null {
		const onFrontmatterTagLine = editor
			.getLine(cursor.line)
			.toLowerCase()
			.startsWith("tags:");
		console.log(onFrontmatterTagLine);
		if (onFrontmatterTagLine) {
			const sub = editor.getLine(cursor.line).substring(0, cursor.ch);
			const match = sub.match(/(?<= )\S+$/)?.first();
			if (match) {
				const matchData = {
					end: cursor,
					start: {
						ch: sub.lastIndexOf(match),
						line: cursor.line,
					},
					query: match,
				};
				return matchData;
			}
		}
		return null;
	}

	getSuggestions(context: EditorSuggestContext): string[] {
		console.log(context.query);
		console.log(this.tags);
		const suggestions = this.tags.filter((p) =>
			p.startsWith(context.query)
		);
		console.log(suggestions);
		return suggestions;
	}

	renderSuggestion(suggestion: string, el: HTMLElement): void {
		const outer = el.createDiv({ cls: "ES-suggester-container" });
		outer.createDiv({ cls: "ES-emoji" }).setText(`#${suggestion}`);
	}

	selectSuggestion(suggestion: string): void {
		if (this.context) {
			(this.context.editor as Editor).replaceRange(
				`${suggestion} `,
				this.context.start,
				this.context.end
			);
		}
	}
}
