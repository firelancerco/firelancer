/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs-extra';
import path from 'path';

import lernaJson from '../../lerna.json';
import { addStream } from './add-stream';

let changelogFileName = 'CHANGELOG.md';
if (process.argv.includes('--next') || process.env.npm_config_argv?.includes('publish-prerelease')) {
    changelogFileName = 'CHANGELOG_NEXT.md';
}

/**
 * The types of commit which will be included in the changelog.
 */
const VALID_TYPES = ['feat', 'fix', 'perf', 'refactor', 'revert'];

/**
 * Define which packages to create changelog entries for.
 */
const VALID_SCOPES: string[] = [
    'admin-ui-plugin',
    'admin-ui',
    'asset-server',
    'asset-server-plugin',
    'cli',
    'common',
    'email-plugin',
    'core',
    'google-auth-plugin',
];

const mainTemplate = fs.readFileSync(path.join(__dirname, 'template.hbs'), 'utf-8');
const commitTemplate = fs.readFileSync(path.join(__dirname, 'commit.hbs'), 'utf-8');

generateChangelogForPackage();

/**
 * Generates changelog entries based on conventional commit messages.
 *
 * This function reads commit history, filters relevant commits, formats them using Handlebars templates,
 * and appends the generated changelog entries to `CHANGELOG.md` (or `CHANGELOG_NEXT.md` for pre-releases).
 *
 * ## Process:
 * - **Filters commits**: Only includes commits of type `feat`, `fix`, or `perf`.
 * - **Scopes filtering**: Only commits that modify specific packages (`admin-ui`, `core`, `cli`, etc.) are included.
 * - **Reads and processes templates**: Uses `template.hbs` and `commit.hbs` to format commit messages.
 * - **Generates structured changelog entries**: Groups commits under headers like "Features" and "Fixes".
 * - **Appends changes to the changelog**: Ensures that new entries are added while preserving existing ones.
 */
async function generateChangelogForPackage() {
    const changelogPath = path.join(__dirname, '../../', changelogFileName);
    const inStream = fs.createReadStream(changelogPath, { flags: 'a+' });
    const tempFile = path.join(__dirname, `__temp_changelog__`);
    const conventionalChangelogCore = (await import('conventional-changelog-core')).default;
    conventionalChangelogCore(
        {
            transform: (commit: any, context: any) => {
                const includeCommit = VALID_TYPES.includes(commit.type) && scopeIsValid(commit.scope);
                if (includeCommit) {
                    return context(null, commit);
                } else {
                    return context(null, null);
                }
            },
            releaseCount: 1,
            outputUnreleased: true,
        },
        {
            version: lernaJson.version,
        },
        undefined,
        undefined,
        {
            mainTemplate,
            commitPartial: commitTemplate,
            finalizeContext(context: any) {
                context.commitGroups.forEach(addHeaderToCommitGroup);
                return context;
            },
        } as any,
    )
        .pipe(addStream(inStream))
        .pipe(fs.createWriteStream(tempFile))
        .on('finish', () => {
            fs.createReadStream(tempFile)
                .pipe(fs.createWriteStream(changelogPath))
                .on('finish', () => {
                    fs.unlinkSync(tempFile);
                });
        });
}

function scopeIsValid(scope?: string): boolean {
    for (const validScope of VALID_SCOPES) {
        if (scope && scope.includes(validScope)) {
            return true;
        }
    }
    return false;
}

/**
 * The `header` is a more human-readable version of the commit type, as used in the
 * template.hbs as a sub-heading.
 */
function addHeaderToCommitGroup(commitGroup: any) {
    switch (commitGroup.title) {
        case 'fix':
            commitGroup.header = 'Fixes';
            break;
        case 'feat':
            commitGroup.header = 'Features';
            break;
        default:
            commitGroup.header = commitGroup.title.charAt(0).toUpperCase() + commitGroup.title.slice(1);
            break;
    }
}
