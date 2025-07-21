# Splits a string.
# Returned array can be empty.
#
# + text - string to be split
# + delimiter - string to split by 
# 
# + return - string array
public function split(string text, string delimiter) returns string[] {
    string[] parts = [];

    int start_index = 0;
    while (start_index < text.length()) {
        int? nextDelimiter = text.indexOf(delimiter, start_index);
        if (nextDelimiter is ()) {
            // if no more delimiters, add the rest of the string
            parts.push(text.substring(start_index));
            break;
        }

        parts.push(text.substring(start_index, nextDelimiter));
        // move past the delimiter
        start_index = nextDelimiter + delimiter.length(); 
    }

    return parts;
}