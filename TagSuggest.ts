import {
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";
import FrontmatterTagSuggestPlugin from "./main";

export default class TagSuggest extends EditorSuggest<string> {
	plugin: FrontmatterTagSuggestPlugin;
	emoji = {
		":100:": "💯",
		":1234:": "🔢",
	};

	constructor(plugin: FrontmatterTagSuggestPlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		_: TFile
	): EditorSuggestTriggerInfo | null {
		const sub = editor.getLine(cursor.line).substring(0, cursor.ch);
		const match = sub.match(/(?<=tags: )\S+$/)?.first();
		if (match) {
			const matchData = {
				end: cursor,
				start: {
					ch: sub.lastIndexOf(match),
					line: cursor.line,
				},
				query: match,
			};
			console.log(matchData);
			return matchData;
		}
		return null;
	}

	getSuggestions(context: EditorSuggestContext): string[] {
		return Object.keys(this.emoji).filter((p) =>
			p.startsWith(context.query)
		);
	}

	renderSuggestion(suggestion: string, el: HTMLElement): void {
		const outer = el.createDiv({ cls: "ES-suggester-container" });
		outer
			.createDiv({ cls: "ES-shortcode" })
			.setText(suggestion.replace(/:/g, ""));
		//@ts-expect-error
		outer.createDiv({ cls: "ES-emoji" }).setText(this.emoji[suggestion]);
	}

	selectSuggestion(suggestion: string): void {
		if (this.context) {
			(this.context.editor as Editor).replaceRange(
				`${suggestion}`,
				this.context.start,
				this.context.end
			);
		}
	}
}
