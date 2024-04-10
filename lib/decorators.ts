///#pragma once

///#include <decoratorfactory.ts>

const enumerable = DecoratorFactory.decorator((_,context: ClassGetterDecoratorContext | ClassFieldDecoratorContext | ClassAccessorDecoratorContext, enumerable: boolean = true) => context.addInitializer(function() {
    Object.defineProperty(this, context.name, {...DecoratorFactory.getPropertyDescriptor(this,context.name), enumerable});
}));