export interface IPageAction {
    name?: string;
    disabled?: boolean;
    caption: string;
    icon?: string;
    action?: () => void;
}