import {Component} from 'angular2/core';
import {Router, RouteConfig, RouteDefinition, ROUTER_DIRECTIVES} from 'angular2/router';
import {TopBar, SearchBar, SideMenu, SplitViewContainer, ContentsListItem, Notification, NotificationHost} from '../index';
import {demos, kebabToPascal, IDemoItem} from './demos';


const routes: RouteDefinition[] = demos.map((demo: IDemoItem) => {
   return {
       path: '/' + demo.name,
       name: kebabToPascal(demo.name),
       component: demo.component
   };
});


@Component({
    selector: 'default',
    template: ''
}) 
class DefaultRoute {}

routes.push({
    path: '/',
    name: 'DefaultRoute',
    component: DefaultRoute
});

@Component({
    selector: 'app',
    template: require('./app.tpl.html'),
    directives: [
        ROUTER_DIRECTIVES,
        TopBar,
        SearchBar,
        SplitViewContainer,
        SideMenu,
        ContentsListItem,
        NotificationHost
    ],
    providers: [Notification]
})
@RouteConfig(routes)
export class App {
    displayMenu: boolean = false;
    contentItems: any[] = demos.map((demo: IDemoItem) => {
        return {
            title: kebabToPascal(demo.name),
            route: kebabToPascal(demo.name)
        };
    });
    filteredContentItems: any[];
    hasContent: boolean = false;
    splitFocus: string = 'left';
    searchQuery: string;
    subscription: any;

    constructor(private router: Router) {
        this.subscription = router.subscribe(route => {
            this.hasContent = !!route;
        });
        this.filteredContentItems = this.contentItems.slice(0);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    filterContentItems(query: string): void {
        if (query && 0 < query.length) {
            this.filteredContentItems = this.contentItems.filter((item: any) => {
                return -1 < item.title.toLowerCase().indexOf(query.toLowerCase());
            });
        } else {
            this.filteredContentItems = this.contentItems.slice(0);
        }
    }

    closeContent(): void {
        this.hasContent = false;
    }

    toggleMenu(newState: boolean): void {
        this.displayMenu = newState;
    }
}
