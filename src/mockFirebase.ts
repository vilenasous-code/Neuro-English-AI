const getStorage = () => {
  const data = localStorage.getItem('mock_db');
  return data ? JSON.parse(data) : {};
};

const setStorage = (data: any) => {
  localStorage.setItem('mock_db', JSON.stringify(data));
};

export const doc = (dbOrCollection: any, path?: string, ...pathSegments: string[]) => {
  const basePath = dbOrCollection.path ? dbOrCollection.path : '';
  const fullPath = [basePath, path, ...pathSegments].filter(Boolean).join('/');
  
  // If no path is provided (e.g., doc(collection(db, 'users'))), generate an ID
  if (!path) {
    const id = Math.random().toString(36).substring(2, 15);
    return { path: `${fullPath}/${id}`, id };
  }
  
  return { path: fullPath, id: fullPath.split('/').pop() };
};

export const collection = (dbOrDoc: any, path: string, ...pathSegments: string[]) => {
  const basePath = dbOrDoc.path ? dbOrDoc.path : '';
  const fullPath = [basePath, path, ...pathSegments].filter(Boolean).join('/');
  return { path: fullPath };
};

export const getDoc = async (docRef: any) => {
  const db = getStorage();
  const data = db[docRef.path];
  return {
    exists: () => !!data,
    data: () => data,
    id: docRef.path.split('/').pop()
  };
};

export const setDoc = async (docRef: any, data: any, options?: any) => {
  const db = getStorage();
  if (options?.merge && db[docRef.path]) {
    db[docRef.path] = { ...db[docRef.path], ...data };
  } else {
    db[docRef.path] = data;
  }
  setStorage(db);
};

export const addDoc = async (collectionRef: any, data: any) => {
  const db = getStorage();
  const id = Math.random().toString(36).substring(2, 15);
  const path = `${collectionRef.path}/${id}`;
  db[path] = data;
  setStorage(db);
  return { id, path };
};

export const updateDoc = async (docRef: any, data: any) => {
  const db = getStorage();
  if (db[docRef.path]) {
    db[docRef.path] = { ...db[docRef.path], ...data };
    setStorage(db);
  }
};

export const writeBatch = (db: any) => {
  const operations: any[] = [];
  return {
    set: (docRef: any, data: any) => {
      operations.push({ type: 'set', path: docRef.path, data });
    },
    update: (docRef: any, data: any) => {
      operations.push({ type: 'update', path: docRef.path, data });
    },
    delete: (docRef: any) => {
      operations.push({ type: 'delete', path: docRef.path });
    },
    commit: async () => {
      const db = getStorage();
      operations.forEach(op => {
        if (op.type === 'set') db[op.path] = op.data;
        if (op.type === 'update') db[op.path] = { ...db[op.path], ...op.data };
        if (op.type === 'delete') delete db[op.path];
      });
      setStorage(db);
    }
  };
};

export const query = (collectionRef: any, ...constraints: any[]) => {
  return { collectionRef, constraints };
};

export const where = (field: string, op: string, value: any) => {
  return { type: 'where', field, op, value };
};

export const orderBy = (field: string, direction: string = 'asc') => {
  return { type: 'orderBy', field, direction };
};

export const limit = (n: number) => {
  return { type: 'limit', value: n };
};

export const getDocs = async (queryRef: any) => {
  const db = getStorage();
  const isCollection = typeof queryRef.path === 'string';
  const path = isCollection ? queryRef.path : queryRef.collectionRef.path;
  const constraints = isCollection ? [] : queryRef.constraints;
  
  let results = Object.keys(db)
    .filter(k => k.startsWith(path + '/') && k.split('/').length === path.split('/').length + 1)
    .map(k => ({ id: k.split('/').pop(), data: () => db[k], ...db[k] }));

  for (const c of constraints) {
    if (c.type === 'where') {
      results = results.filter(r => {
        const val = r.data()[c.field];
        if (c.op === '==') return val === c.value;
        if (c.op === '>') return val > c.value;
        if (c.op === '<') return val < c.value;
        if (c.op === '>=') return val >= c.value;
        if (c.op === '<=') return val <= c.value;
        return true;
      });
    }
  }

  const orderC = constraints.find(c => c.type === 'orderBy');
  if (orderC) {
    results.sort((a, b) => {
      const valA = a.data()[orderC.field];
      const valB = b.data()[orderC.field];
      if (valA < valB) return orderC.direction === 'asc' ? -1 : 1;
      if (valA > valB) return orderC.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const limitC = constraints.find(c => c.type === 'limit');
  if (limitC) {
    results = results.slice(0, limitC.value);
  }

  return {
    docs: results.map(r => ({
      id: r.id,
      data: r.data,
      exists: () => true
    }))
  };
};
