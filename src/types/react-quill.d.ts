declare module 'react-quill' {
    import { Component } from 'react';
    import Quill from 'quill';

    export interface ReactQuillProps {
        value?: string;
        defaultValue?: string;
        placeholder?: string;
        readOnly?: boolean;
        onChange?: (content: string, delta: any, source: string, editor: any) => void;
        onChangeSelection?: (selection: any, source: string, editor: any) => void;
        onFocus?: (selection: any, source: string, editor: any) => void;
        onBlur?: (previousSelection: any, source: string, editor: any) => void;
        onKeyPress?: (event: any) => void;
        onKeyDown?: (event: any) => void;
        onKeyUp?: (event: any) => void;
        tabIndex?: number;
        bounds?: string | HTMLElement;
        children?: any;
        className?: string;
        formats?: string[];
        id?: string;
        modules?: any;
        preserveWhitespace?: boolean;
        scrollingContainer?: string | HTMLElement;
        style?: React.CSSProperties;
        theme?: string;
    }

    export default class ReactQuill extends Component<ReactQuillProps> {
        editor?: Quill;
        getEditor(): Quill;
        focus(): void;
        blur(): void;
    }
}

declare module 'quill' {
    export default class Quill {
        constructor(container: string | Element, options?: any);
        deleteText(index: number, length: number, source?: string): any;
        disable(): void;
        enable(enabled?: boolean): void;
        getContents(index?: number, length?: number): any;
        getLength(): number;
        getText(index?: number, length?: number): string;
        insertEmbed(index: number, type: string, value: any, source?: string): any;
        insertText(index: number, text: string, source?: string): any;
        insertText(index: number, text: string, formats: any, source?: string): any;
        setContents(delta: any, source?: string): any;
        setText(text: string, source?: string): any;
        update(source?: string): void;
        updateContents(delta: any, source?: string): any;
        format(name: string, value: any, source?: string): any;
        formatLine(index: number, length: number, source?: string): any;
        formatLine(index: number, length: number, format: string, value: any, source?: string): any;
        formatLine(index: number, length: number, formats: any, source?: string): any;
        formatText(index: number, length: number, source?: string): any;
        formatText(index: number, length: number, format: string, value: any, source?: string): any;
        formatText(index: number, length: number, formats: any, source?: string): any;
        getFormat(range?: any): any;
        getFormat(index: number, length?: number): any;
        removeFormat(index: number, length: number, source?: string): any;
        blur(): void;
        focus(): void;
        getBounds(index: number, length?: number): any;
        getSelection(focus?: boolean): any;
        setSelection(index: number, length: number, source?: string): void;
        setSelection(range: any, source?: string): void;
        on(eventName: string, handler: Function): any;
        once(eventName: string, handler: Function): any;
        off(eventName: string, handler: Function): any;
    }
}
