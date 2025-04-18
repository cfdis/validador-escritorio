export interface View {
    init(params?: any): void;
    destroy?(): void;
}