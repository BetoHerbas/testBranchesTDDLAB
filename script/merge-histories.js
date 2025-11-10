import fs from 'fs';
import { getHistoryFilePaths } from './branch-utils.js';

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading or parsing JSON file: ${filePath}`, error);
    return [];
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to JSON file: ${filePath}`, error);
  }
}

function mergeHistories(sourceBranch, targetBranch) {
  console.log(`Merging history from '${sourceBranch}' into '${targetBranch}'...`);

  const sourcePaths = getHistoryFilePaths(sourceBranch);
  const targetPaths = getHistoryFilePaths(targetBranch);

  // Merge commit-history.json
  const sourceCommits = readJsonFile(sourcePaths.commitHistory);
  const targetCommits = readJsonFile(targetPaths.commitHistory);
  const targetCommitShas = new Set(targetCommits.map(c => c.sha));

  let newCommits = 0;
  sourceCommits.forEach(sourceCommit => {
    // Evitar duplicados y el marcador HEAD que a veces puede quedar
    if (sourceCommit.sha !== 'HEAD' && !targetCommitShas.has(sourceCommit.sha)) {
      targetCommits.push(sourceCommit);
      newCommits++;
    }
  });

  // Ordenar el historial combinado por fecha
  targetCommits.sort((a, b) => new Date(a.commit.date) - new Date(b.commit.date));
  writeJsonFile(targetPaths.commitHistory, targetCommits);
  console.log(`Merged ${newCommits} new commits into '${targetPaths.commitHistory}'.`);

  // Merge tdd_log.json
  const sourceTddLog = readJsonFile(sourcePaths.tddLog);
  const targetTddLog = readJsonFile(targetPaths.tddLog);
  // Usar una combinación de timestamp y testId para identificar entradas únicas
  const targetTddEntries = new Set(targetTddLog.map(e => `${e.timestamp}-${e.testId}`));

  let newTddEntries = 0;
  sourceTddLog.forEach(sourceEntry => {
    const uniqueId = `${sourceEntry.timestamp}-${sourceEntry.testId}`;
    if (!targetTddEntries.has(uniqueId)) {
      targetTddLog.push(sourceEntry);
      newTddEntries++;
    }
  });

  // Ordenar el log combinado por timestamp
  targetTddLog.sort((a, b) => a.timestamp - b.timestamp);
  writeJsonFile(targetPaths.tddLog, targetTddLog);
  console.log(`Merged ${newTddEntries} new TDD log entries into '${targetPaths.tddLog}'.`);

  // Limpieza de los archivos de la rama de origen
  try {
    console.log(`Cleaning up history files for branch '${sourceBranch}'...`);
    if (fs.existsSync(sourcePaths.commitHistory)) {
      fs.unlinkSync(sourcePaths.commitHistory);
    }
    if (fs.existsSync(sourcePaths.tddLog)) {
      fs.unlinkSync(sourcePaths.tddLog);
    }
    console.log('Cleanup complete.');
  } catch (error) {
    console.error(`Error cleaning up files for branch '${sourceBranch}'. Please remove them manually.`, error);
  }
}

// --- Main execution ---
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node script/merge-histories.js <source-branch> <target-branch>');
  process.exit(1);
}

const [sourceBranch, targetBranch] = args;
mergeHistories(sourceBranch, targetBranch);
