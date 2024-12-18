export class DigitalSignature {
  static async generateKeyPair() {
    try {
      // Generate ECDSA key pair using P-384 curve
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-384"
        },
        true, // extractable
        ["sign", "verify"]
      );

      // Export public key for storage
      const publicKeyBuffer = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
      );
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));

      return {
        keyPair,
        publicKeyBase64
      };
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw new Error('Failed to generate digital signature keys');
    }
  }

  static async signData(data, privateKey) {
    try {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);
      
      const signature = await window.crypto.subtle.sign(
        {
          name: "ECDSA",
          hash: { name: "SHA-384" },
        },
        privateKey,
        encodedData
      );

      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    } catch (error) {
      console.error('Error signing data:', error);
      throw new Error('Failed to create digital signature');
    }
  }

  static async verifySignature(data, signatureBase64, publicKeyBase64) {
    try {
      // Use the same normalization as in createSignatureBundle
      const dataString = this.normalizeDataString(JSON.parse(data));
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(dataString);
      
      // Convert base64 signature back to ArrayBuffer
      const signatureBuffer = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
      
      // Convert base64 public key back to CryptoKey
      const publicKeyBuffer = Uint8Array.from(atob(publicKeyBase64), c => c.charCodeAt(0));
      const publicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        {
          name: "ECDSA",
          namedCurve: "P-384"
        },
        true,
        ["verify"]
      );

      return await window.crypto.subtle.verify(
        {
          name: "ECDSA",
          hash: { name: "SHA-384" },
        },
        publicKey,
        signatureBuffer,
        encodedData
      );
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  static async hashData(data) {
    try {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-384', encodedData);
      return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    } catch (error) {
      console.error('Error hashing data:', error);
      throw new Error('Failed to hash data');
    }
  }

  static async getTimestamp() {
    return new Date().toISOString();
  }

  static async createSignatureBundle(data, privateKey) {
    try {
      const timestamp = await this.getTimestamp();
      
      // Create a normalized data structure with fixed order
      const normalizedData = {
        version: '1.0',
        timestamp: timestamp,
        invoiceId: data.invoiceId || '',
        userId: data.userId || '',
        signatureImage: data.signatureImage || '',
        signedAt: data.signedAt || timestamp
      };
      
      // Convert to string with stable ordering
      const dataString = this.normalizeDataString(normalizedData);
      const hash = await this.hashData(dataString);
      const signature = await this.signData(dataString, privateKey);
      
      return {
        data: normalizedData,
        hash,
        signature,
        timestamp,
        version: '1.0'
      };
    } catch (error) {
      console.error('Error creating signature bundle:', error);
      throw new Error('Failed to create signature bundle');
    }
  }

  // Add new helper method for consistent data normalization
  static normalizeDataString(data) {
    // Ensure fixed order of properties
    const orderedData = {
      version: data.version || '1.0',
      timestamp: data.timestamp || '',
      invoiceId: data.invoiceId || '',
      userId: data.userId || '',
      signatureImage: data.signatureImage || '',
      signedAt: data.signedAt || ''
    };
    
    // Use stable stringify
    return JSON.stringify(orderedData);
  }
} 