import {Component, ContentChildren, QueryList, AfterContentInit, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {Tab} from './tab.component';
import {coerceToBoolean} from '../../common/coerce-to-boolean';

/**
 * Tabs can be either pure or stateful. Stateful tabs will keep track of which one is active by keeping an internal
 * state.
 *
 * Pure tabs will only change the active tab when the `activeId` property is updated.
 *
 * ##### Stateful Tabs
 * ```
 * <gtx-tabs (tabChange)="goToTab($event)">
 *     <gtx-tab title="Details">Optional content here.</gtx-tab>
 *     <gtx-tab title="Orders"></gtx-tab>
 *     <gtx-tab title="Notes"></gtx-tab>
 * </gtx-tabs>
 * ```
 *
 * ##### Pure Tabs
 * ```
 * <gtx-tabs pure [activeId]="activeTab">
 *     <gtx-tab title="Details" id="1" (select)="activeTab = $event"></gtx-tab>
 *     <gtx-tab title="Orders" id="2" (select)="activeTab = $event"></gtx-tab>
 *     <gtx-tab title="Notes" id="3" (select)="activeTab = $event"></gtx-tab>
 * </gtx-tabs>
 * ```
 *
 * ##### With `routerLink`
 * A gtx-tab can take an optional `[routerLink]` binding which will set router links for the tabs.
 * ```
 * <gtx-tabs pure [activeId]="activeTab">
 *     <gtx-tab title="Details" id="1" [routerLink]="['customer', 'details']"></gtx-tab>
 *     <gtx-tab title="Orders" id="2" [routerLink]="['customer', 'orders']"></gtx-tab>
 *     <gtx-tab title="Notes" id="3" [routerLink]="['customer', 'notes']"></gtx-tab>
 * </gtx-tabs>
 * ```
 */
@Component({
    selector: 'gtx-tabs',
    templateUrl: './tabs.tpl.html'
})
export class Tabs implements AfterContentInit {

    @ContentChildren(Tab) tabs: QueryList<Tab>;
    /**
     * Fires an event whenever the active tab changes. Argument is the id of the selected tab.
     */
    @Output() tabChange = new EventEmitter<string>();

    /**
     * The id of the active tab. Should only be used in pure (stateless) mode.
     */
    @Input() activeId: string;

    /**
     * When present, sets the tabs to pure (stateless) mode.
     */
    @Input() set pure(val: any) {
        this.isPure = val != null;
    }

    /**
     * When present (or set to true), tabs which do not fit into the width of their container will wrap onto
     * a new line. Otherwise, tabs will remain on one line and the contents will be elided if all the available
     * space is filled.
     */
    @Input() set wrap(val: any) {
        this.tabsShouldWrap = coerceToBoolean(val);
    }

    tabsShouldWrap: boolean = false;
    private isPure: boolean = false;

    ngAfterContentInit(): void {
        if (this.isPure) {
            setTimeout(() => this.setActiveTab());
        } else {
            let activeTabs = this.tabs.filter(tab => tab.active);

            // if there is no active tab set, activate the first
            if (activeTabs.length === 0) {
                this.tabs.first.active = true;
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.setActiveTab();
    }

    /**
     * Sets the tab with id === this.activeId to active.
     */
    setActiveTab(): void {
        if (this.tabs) {
            let tabToActivate = this.tabs.filter(t => t.id === this.activeId)[0];
            if (tabToActivate) {
                this.setAsActive(tabToActivate);
            }
        }
    }

    /**
     * Invoked when a tab link is clicked.
     */
    selectTab(tab: Tab): void {
        if (tab.disabled) {
            return;
        }
        if (!this.isPure) {
            this.setAsActive(tab);
            this.tabChange.emit(tab.id);
        } else {
            tab.select.emit(tab.id);
        }
    }

    private setAsActive(tab: Tab): void {
        this.tabs.toArray().forEach(tab => tab.active = false);
        tab.active = true;
    }

}
