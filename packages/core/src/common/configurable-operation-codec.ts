import { forwardRef, Inject, Injectable, Type } from '@nestjs/common';

import { CollectionFilter, ConfigService } from '../config';
import { ConfigurableOperationDef } from './configurable-operation';
import { InternalServerException } from './error/errors';
import { IdCodecService } from './id-codec.service';
import { ConfigurableOperation, ConfigurableOperationInput } from './shared-schema';

@Injectable()
export class ConfigurableOperationCodec {
    constructor(
        @Inject(forwardRef(() => ConfigService))
        private configService: ConfigService,
        private idCodecService: IdCodecService,
    ) {}

    /**
     * Decodes any ID type arguments of a ConfigurableOperationDef
     */
    decodeConfigurableOperationIds<T extends ConfigurableOperationDef<any>>(
        defType: Type<ConfigurableOperationDef<any>>,
        input: ConfigurableOperationInput[],
    ): ConfigurableOperationInput[] {
        const availableDefs = this.getAvailableDefsOfType(defType);
        for (const operationInput of input) {
            const def = availableDefs.find(d => d.code === operationInput.code);
            if (!def) {
                continue;
            }
            for (const arg of operationInput.arguments) {
                const argDef = def.args[arg.name];
                if (argDef && argDef.type === 'ID' && arg.value) {
                    if (argDef.list === true) {
                        const ids = JSON.parse(arg.value) as string[];
                        const decodedIds = ids.map(id => this.idCodecService.decode(id));
                        arg.value = JSON.stringify(decodedIds);
                    } else {
                        arg.value = this.idCodecService.decode(arg.value);
                    }
                }
            }
        }
        return input;
    }

    /**
     * Encodes any ID type arguments of a ConfigurableOperationDef
     */
    encodeConfigurableOperationIds<T extends ConfigurableOperationDef<any>>(
        defType: Type<ConfigurableOperationDef<any>>,
        input: ConfigurableOperation[],
    ): ConfigurableOperation[] {
        const availableDefs = this.getAvailableDefsOfType(defType);
        for (const operationInput of input) {
            const def = availableDefs.find(d => d.code === operationInput.code);
            if (!def) {
                continue;
            }
            for (const arg of operationInput.args) {
                const argDef = def.args[arg.name];
                if (argDef && argDef.type === 'ID' && arg.value) {
                    if (argDef.list === true) {
                        const ids = JSON.parse(arg.value) as string[];
                        const encodedIds = ids.map(id => this.idCodecService.encode(id));
                        arg.value = JSON.stringify(encodedIds);
                    } else {
                        const encodedId = this.idCodecService.encode(arg.value);
                        arg.value = JSON.stringify(encodedId);
                    }
                }
            }
        }
        return input;
    }

    // TODO: This is a temporary solution to get the available defs of a given type.
    // We should move this to a more permanent location in the future.
    getAvailableDefsOfType(defType: Type<ConfigurableOperationDef>): ConfigurableOperationDef[] {
        switch (defType) {
            case CollectionFilter:
                return this.configService.catalogOptions.collectionFilters;
            default:
                throw new InternalServerException('error.unknown-configurable-operation-definition', {
                    name: defType.name,
                });
        }
    }
}
