import {
    Component,
    EventEmitter,
    Input,
    Optional,
    Output
} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/common';
import {isPresent} from 'angular2/src/facade/lang';

export type CheckState = boolean | 'indeterminate';

/**
 * Checkbox wraps the native `<input type="checkbox">` form element.
 *
 * ```html
 * <gtx-checkbox [(ngModel)]="isOkay" label="Is it okay?"></gtx-checkbox>
 * <gtx-checkbox [(ngModel)]="checkStates.B" value="B" label="B"></gtx-checkbox>
 * ```
 */
@Component({
    selector: 'gtx-checkbox',
    template: require('./checkbox.tpl.html')
})
export class Checkbox implements ControlValueAccessor {

    /**
     * Checked state of the checkbox
     */
    @Input() get checked(): boolean {
        return this.checkState === true;
    }
    set checked(val: boolean) {
        if (val != this.checkState) {
            this.checkState = val;
            this.change.emit(val);
            this.onChange(val);
        }
    }

    /**
     * Set to "indeterminate" for an indeterminate state (-)
     */
    @Input() get indeterminate(): boolean {
        return this.checkState === 'indeterminate';
    }
    set indeterminate(val: boolean) {
        if (val != (this.checkState === 'indeterminate')) {
            this.checkState = val ? 'indeterminate' : false;
            this.change.emit(this.checkState);
            this.onChange(this.checkState);
        }
    }

    /**
     * Set the checkbox to its disabled state.
     */
    @Input() disabled: boolean = false;
    /**
     * Checkbox ID
     */
    @Input() id: string = 'checkbox-' + Math.random().toString(36).substr(2);
    /**
     * Label for the checkbox
     */
    @Input() label: string = '';
    /**
     * Form name for the checkbox
     */
    @Input() name: string;
    /**
     * Sets the readonly property
     */
    @Input() readonly: boolean = false;
    /**
     * Sets the required property
     */
    @Input() required: boolean = false;
    /**
     * The value of the checkbox
     */
    @Input() value: any = '';

    /**
     * Blur event
     */
    @Output() blur = new EventEmitter<CheckState>();
    /**
     * Focus event
     */
    @Output() focus = new EventEmitter<CheckState>();
    /**
     * Change event
     */
    @Output() change = new EventEmitter<CheckState>();

    private checkState: CheckState = false;

    private onChange: Function = () => {};
    private onTouched: Function = () => {};

    constructor(@Optional() control: NgControl) {
        if (control && !control.valueAccessor) {
            control.valueAccessor = this;
        }
    }

    onBlur(): void {
        this.blur.emit(this.checkState);
        this.onTouched();
    }

    onFocus(): void {
        this.focus.emit(this.checkState);
    }

    registerOnChange(fn: Function): void { this.onChange = fn; }
    registerOnTouched(fn: Function): void { this.onTouched = fn; }

    writeValue(value: any): void {
        if (value !== this.checkState) {
            this.checkState = value;
            this.change.emit(value);
        }
    }

    ngOnInit(): void {
        this.onChange(this.checkState);
    }

    private onInputChanged(input: HTMLInputElement): void {
        let newState: CheckState = input.indeterminate ? 'indeterminate' : input.checked;
        if (newState != this.checkState) {
            this.checkState = newState;
            this.change.emit(newState);
            this.onChange(newState);
        }
    }
}
