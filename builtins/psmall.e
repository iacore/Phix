--
-- psmall.e
-- ========
--
--  Phix implementation of smallest() and largest().
--  NB: While on desktop/Phix these are now aliases of minsq and maxsq, this file is still "active" under p2js [DEV/temp...]
--
--  Compatibility Note: This differs from the OpenEuphoria version of smallest() in std\stats.e in (at least) three ways:
--   * The set passed in the first parameter must be a non-empty sequence (compilation or run-time error if passed an atom or {})
--   * It can return non-atoms in the set (if no atoms occur, it will be the first in an alphabetical and case-sensitive ordering)
--   * It can return the index of the lowest entry, rather than the actual value of the lowest entry.
--  This should not, imho, cause sensibly-written code to be incompatible/misbehave. Despite the fact this is an autoinclude,
--  consider explicitly including this with a namespace and using that to qualify any calls, to avoid potential problems with 
--  code written and tested on Phix, should you later try and run it on OpenEuphoria.
--  This routine is very similar to minsq(), except that this has the optional return_index parameter, and by extension (see
--  the docs) min(s), which also has other incompatibilities with OpenEuphoria (non-recursive processing etc).

global function smallest(sequence set, integer return_index=0)
    if length(set)=0 then ?9/0 end if
    object res = iff(return_index?1:set[1])
    for i=2 to length(set) do
        object tmp = set[i]
        if return_index then
--          if return_index=2
            if tmp<set[res] then
                res = i
            end if
        elsif tmp<res then
            res = tmp
        end if
    end for
    return res
end function

global function largest(sequence set, integer return_index=0)
    if length(set)=0 then ?9/0 end if
    object res = iff(return_index?1:set[1])
    for i=2 to length(set) do
        object tmp = set[i]
        if return_index then
            if tmp>set[res] then
                res = i
            end if
        elsif tmp>res then
            res = tmp
        end if
    end for
    return res
end function
