import 'reflect-metadata';

const metadataKey = Symbol('command');

const commandRegister = [];

export function getCommands() {
  return commandRegister;
}

export function Command(commandName?: string): (target: Object, propertyName: string, propertyDesciptor: PropertyDescriptor) => void {
  return function (target: Object, propertyName: string, propertyDesciptor: PropertyDescriptor): void {
    let properties: string[] = Reflect.getMetadata(metadataKey, target);
    commandRegister[commandName] = propertyDesciptor.value.name;
    if (properties) {
      properties.push(propertyName);
    } else {
      properties = [propertyName];
      Reflect.defineMetadata(metadataKey, properties, target);
    }
    console.log(commandRegister);
  }
}
