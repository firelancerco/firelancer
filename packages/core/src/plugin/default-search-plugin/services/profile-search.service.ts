import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ID, SearchIndex } from '@firelancerco/common/lib/generated-schema';
import { ProfileSearchIndexItem } from '../entities/profile-search-index-item.entity';

@Injectable()
export class ProfileSearchService {
    constructor(
        @InjectRepository(ProfileSearchIndexItem)
        private profileSearchIndexRepository: Repository<ProfileSearchIndexItem>,
    ) {}

    async updateSearchIndex(profileId: ID, title: string, description: string, enabled: boolean): Promise<void> {
        const searchIndex = await this.profileSearchIndexRepository.findOne({
            where: { id: profileId },
        });

        if (searchIndex) {
            await this.profileSearchIndexRepository.update(
                { id: profileId },
                {
                    title,
                    description,
                    enabled,
                },
            );
        } else {
            await this.profileSearchIndexRepository.save({
                id: profileId,
                title,
                description,
                enabled,
                index: SearchIndex.Profile,
                facetIds: [],
                facetValueIds: [],
                collectionIds: [],
                collectionSlugs: [],
                score: 0,
            });
        }
    }

    async deleteSearchIndex(profileId: ID): Promise<void> {
        await this.profileSearchIndexRepository.delete({ id: profileId });
    }
}
