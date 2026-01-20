cat << 'EOF' > ~/projects/caffeine-app/src/backend/HttpUtils.mo
import Text "mo:core/Text";

module {
    public type TransformationInput = { 
        response : { 
            status : Nat32; 
            headers : [(Text, Text)]; 
            body : Blob 
        }; 
        context : Blob 
    };
    
    public type TransformationOutput = { 
        response : { 
            status : Nat32; 
            headers : [(Text, Text)]; 
            body : Blob 
        } 
    };

    public func transform(input : TransformationInput) : TransformationOutput {
        { response = input.response };
    };

    public func httpGetRequest(url : Text, headers : [(Text, Text)]) : async () {
        // Implementation logic here
    };
};
EOF