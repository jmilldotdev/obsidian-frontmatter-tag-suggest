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
		this.tags = this.getTags();
	}

	getTags(): string[] {
		const app = this.plugin.app;
		let tags: string[] = [];
		const files = app.vault.getMarkdownFiles();
		files.forEach((p) => {
			const cache = app.metadataCache.getFileCache(p);
			tags.push(...getAllTags(cache));
		});
		return [...new Set(tags)].sort().map((p) => p.split("#").pop());
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
		if (onFrontmatterTagLine) {
			const sub = editor.getLine(cursor.line).substring(0, cursor.ch);
			const match = sub.match(/(?<= )\S+$/)?.first();
			if (match) {
				this.tags = this.getTags();
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
		const suggestions = this.tags.filter((p) =>
			p.toLowerCase().contains(context.query.toLowerCase())
		);
		return suggestions;
	}

	renderSuggestion(suggestion: string, el: HTMLElement): void {
		const outer = el.createDiv({ cls: "ES-suggester-container" });
		outer.createDiv({ cls: "ES-tags" }).setText(`#${suggestion}`);
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
