// Client-side only module - should only run in browser
let dbInstance: any = null;

// Dummy db for server-side or before initialization
const dummyDb = {
  useAuth: () => ({ user: null, isLoading: false, error: null }),
  useQuery: () => ({ data: null, isLoading: false, error: null }),
  transact: async () => {},
  auth: {
    signIn: async () => {
      throw new Error("DB not initialized yet");
    },
    signUp: async () => {
      throw new Error("DB not initialized yet");
    },
    signOut: async () => {},
  },
};

function getOrInitDb() {
  // Server-side: return dummy
  if (typeof window === 'undefined') {
    return dummyDb;
  }

  // Client-side: initialize if needed
  if (!dbInstance) {
    try {
      const { init } = require("@instantdb/react");
      dbInstance = init({
        appId: "f546c3c3-9f4f-46ea-9834-3daa9ee0fbdc",
      });
    } catch (error: any) {
      console.error("InstantDB initialization error:", error);
      return dummyDb;
    }
  }

  return dbInstance;
}

// Create a multi-level Proxy that works for nested properties
const createDeepProxy = (target: any): any => {
  return new Proxy(target, {
    get(_, prop) {
      const db = getOrInitDb();
      const value = db[prop];
      
      // If the value is an object (like 'auth'), wrap it in a proxy too
      if (value && typeof value === 'object' && !value.$$typeof) {
        return new Proxy(value, {
          get(_, nestedProp) {
            return value[nestedProp];
          }
        });
      }
      
      return value;
    }
  });
};

export const db = createDeepProxy({});
