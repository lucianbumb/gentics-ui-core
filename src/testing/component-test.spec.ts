import {Component, Injectable} from '@angular/core';
import {addProviders, tick, inject, TestComponentBuilder} from '@angular/core/testing';

import {mustFail} from './must-fail';
import {componentTest} from './component-test';


describe('componentTest', () => {

    it('mark a test as passed when its expectations succeed',
        componentTest(() => SimpleComponent, fixture => {
            expect(fixture).toBeDefined();
            expect(fixture.nativeElement.innerText).toMatch(/This should pass/);
            expect(1).toBe(1);
        })
    );

    it('ignores caught exceptions',
        componentTest(() => SimpleComponent, fixture => {
            try {
                throw new Error('This should be ignored by componentTest().');
            } catch (ignore) { }
        })
    );

    it('creates a fakeAsync zone, allowing the use of tick()',
        componentTest(() => SimpleComponent, fixture => {
            let triggered = false;
            setTimeout(() => triggered = true, 500);
            expect(triggered).toBe(false);

            const callTick = () => tick(500);
            expect(callTick).not.toThrowError(/code should be running in the fakeAsync zone/);
            expect(triggered).toBe(true);
        })
    );

    it('ignores caught exceptions',
        componentTest(() => SimpleComponent, fixture => {
            try {
                throw new Error('This should be ignored by componentTest().');
            } catch (ignore) { }
        })
    );

    it('marks the test as failed on uncaught exceptions',
        mustFail(
            componentTest(() => SimpleComponent, fixture => {
                throw new Error('This should be handled by componentTest().');
            })
        )
    );

    it('reacts to failed expectations after other expectations succeed',
        mustFail(
            componentTest(() => SimpleComponent, fixture => {
                expect(1).toBe(1);
                expect('yes').toBe('yes');
                expect('something totally different').toBe(3.14);
            })
        )
    );

    it('marks the test as failed if expectations are not fulfilled',
        mustFail(
            componentTest(() => SimpleComponent, fixture => {
                expect(fixture.componentInstance.nonExistingProperty).toBe('there');
            })
        )
    );

    it('marks the test as failed if early expectations fail and later expectations succeed',
        mustFail(
            componentTest(() => SimpleComponent, fixture => {
                expect('black').toBe('a very bright white');
                expect(23).toBe('the last digit of PI');
                expect('a truth').toBe('a truth');
                expect('a lie').toBe('a lie');
            })
        )
    );

    it('allows overwriting the template with a string parameter',
        componentTest(() => SimpleComponent, 'Overwritten template!', fixture => {
            expect(fixture).toBeDefined();
            expect(fixture.nativeElement.innerText).toBe('Overwritten template!');
        })
    );

    it('allows overwriting the template via the TestComponentBuilder',
        componentTest(() => SimpleComponent,
            tcb => tcb.overrideTemplate(SimpleComponent, 'Overwritten template!'),
            fixture => {
                expect(fixture).toBeDefined();
                expect(fixture.nativeElement.innerText).toBe('Overwritten template!');
            }
        )
    );

    it('destroys the component it creates, calling their ngOnDestroy method', () => {
        let onDestroy: jasmine.Spy;
        let test = componentTest(() => ComponentWithOnDestroy, (fixture, instance) => {
            onDestroy = instance.ngOnDestroy = jasmine.createSpy('ngOnDestroy');
        });
        test();
        expect(onDestroy).toHaveBeenCalled();
    });

    describe('dependency handling', () => {

        beforeEach(() => addProviders([
            PieService
        ]));

        it('allows access to providers added with beforeEach(addProviders())',
            componentTest(() => ComponentThatNeedsAnExistingService, (fixture, instance) => {
                expect(instance.service).toBeDefined();
                expect(instance.service.getPie()).toMatch(/Apple/);
            })
        );

        it('allows overwriting providers via the TestComponentBuilder',
            componentTest(() => ComponentThatNeedsAnExistingService,
                tcb => tcb.overrideProviders(ComponentThatNeedsAnExistingService, [
                    { provide: PieService, useClass: OverwrittenPieService }
                ]),
                (fixture, instance) => {
                    expect(instance.service).toBeDefined();
                    expect(instance.service.getPie()).toBeCloseTo(3.14, 2);
                }
            )
        );

        it('marks the test as failed if a provider is not added via addProviders()',
            mustFail(
                componentTest(() => ComponentThatNeedsAServiceThatIsNotAddedAsProvider, () => {})
            )
        );

    });

});


@Component({
    template: 'This should pass'
})
class SimpleComponent { }


@Component({
    template: 'This should fail'
})
class ComponentThatThrowsInConstructor {
    constructor() {
        throw new Error('Something went wrong in ComponentThatThrowsInConstructor.');
    }
}

@Component({
    template: 'This will be destroyed'
})
class ComponentWithOnDestroy {
    ngOnDestroy(): void { }
}


@Injectable()
class ServiceThatIsNotAddedAsProvider {}

@Component({
    template: 'This component is missing its provider'
})
class ComponentThatNeedsAServiceThatIsNotAddedAsProvider {
    constructor(svc: ServiceThatIsNotAddedAsProvider) { }
}


@Injectable()
class PieService {
    getPie(): string { return 'Spiced Apple Pie'; }
}

@Injectable()
class OverwrittenPieService {
    getPie(): number { return 3.14159265359; }
}

@Component({
    template: 'I spy with my little pie'
})
class ComponentThatNeedsAnExistingService {
    constructor(public service: PieService) {}
}