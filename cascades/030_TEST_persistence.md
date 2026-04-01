TEST CHECKPOINT: Verify data persistence and autosave work correctly.

This is a critical test for data integrity:

1. Start server: `node server/index.js &`
2. Wait 2 seconds

3. Test data round-trip:
   a. GET current project: `curl -s http://localhost:3000/api/project/current > /tmp/orig.json`
   b. Modify project name via API:
      `curl -s -X POST http://localhost:3000/api/project/current -H "Content-Type: application/json" -d '{"projectData": '"$(cat /tmp/orig.json | python3 -c "import sys,json; d=json.load(sys.stdin); d['projectMeta']['projectName']='PERSISTENCE TEST'; print(json.dumps(d))")"'}'`
   c. GET again and verify name changed:
      `curl -s http://localhost:3000/api/project/current | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['projectMeta']['projectName']=='PERSISTENCE TEST', 'Name not updated'; print('PASS: Name persisted')"`
   d. Restore original:
      `curl -s -X POST http://localhost:3000/api/project/current -H "Content-Type: application/json" -d '{"projectData": '"$(cat /tmp/orig.json)"'}'`

4. Test version creation and restoration:
   a. Create version: `curl -s -X POST http://localhost:3000/api/project/version -H "Content-Type: application/json" -d '{"label":"Test Persistence","projectData":'"$(cat /tmp/orig.json)"'}'`
   b. List versions: `curl -s http://localhost:3000/api/project/versions | python3 -c "import sys,json; d=json.load(sys.stdin); print('Versions:', len(d.get('versions',[]))); assert len(d.get('versions',[])) > 0, 'No versions found'; print('PASS')"`
   c. Open version by ID: get the first version ID and fetch it

5. Test autosave endpoint:
   `curl -s -X POST http://localhost:3000/api/project/autosave -H "Content-Type: application/json" -d '{"projectData":'"$(cat /tmp/orig.json)"'}' | python3 -c "import sys,json; d=json.load(sys.stdin); print('Autosave:', d); assert d.get('success'), 'Autosave failed'; print('PASS')"`

6. Verify database integrity:
   `node -e "const db=require('./server/db/db.js'); const p=db.prepare('SELECT COUNT(*) as c FROM projects').get(); console.log('Projects:', p.c); const s=db.prepare('SELECT COUNT(*) as c FROM project_snapshots').get(); console.log('Snapshots:', s.c); console.log('PASS');"`

7. Kill server and clean up temp files

Report all results. Fix any failures.

Commit: "030: TEST - Persistence and autosave verified"
