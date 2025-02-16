// auto-generated by pwa/p2js, see http://phix.x10.mx
"use strict";
//
// permute.e
// Copyright Pete Lomax 2004
// see demo\permutes.exw
//

/*global*/ function permute(/*integer*/ n, /*sequence*/ s, /*bool*/ bFast=false) {
//
// return the nth permute of the given set.
// n should be an integer in the range 1 to factorial(length(s))
// For bFast=false only:
// results in lexicographic order, assuming that s is on entry.
//
    let /*integer*/ l = length(s);
    let /*sequence*/ res = repeat(((string(s)) ? 0X20 : 0),l);
    n -= 1;
    if (bFast) {
        // (old and somewhat quirky algorithm, but faster)
        if (!string(s)) {
//          s = deep_copy(s,1)  -- (top level only needed)
            let /*object*/ t = s;
            s = repeat(0,l);
            for (let i=1, i$lim=l; i<=i$lim; i+=1) {
                s = $repe(s,i,$subse(t,i));
            }
            t = 0;
        }
        for (let i=l; i>=1; i-=1) {
            let /*integer*/ w = remainder(n,i)+1;
//          w = (i+1)-w         -- (slightly better ordering)
            res = $repe(res,i,$subse(s,w));
            s = $repe(s,w,$subse(s,i));
//          s[w..i-1] = s[w+1..i]   -- (ever so "")
            n = floor(n/i);
        }
    } else {
        // (new[1.0.2] lexicographic position order algorithm)
        let /*sequence*/ tags = tagset(l);
        for (let i=l; i>=1; i-=1) {
            let /*integer*/ fi = factorial(i-1), 
                            w = floor(n/fi)+1, 
                            tw = $subse(tags,w);
            res = $repe(res,-i,$subse(s,tw));
//          tags[w..w] = {} -- noticeably slower than:
            l -= 1;
            for (let j=w, j$lim=l; j<=j$lim; j+=1) {
                tags = $repe(tags,j,$subse(tags,j+1));
            }
            n = remainder(n,fi);
        }
    }
    return res;
}

/*global*/ function permutes(/*sequence*/ s, /*integer*/ cb=0, k=length(s)) {
    // eg permutes("123") ==> {"123","132","213","231","312","321"}
    let /*integer*/ l = length(s);
//  assert(k<=l)
    let /*sequence*/ res = ["sequence"];
//  if l then
    if (k<=l) {
        let /*sequence*/ tags = custom_sort(s,tagset(l)), 
                         uses = repeat(1,l); // duplicates
        let /*integer*/ p = $subse(tags,1), high_p = 1, dups = 0, 
                        maxparam = ((cb===0) ? 0 : $subse(get_routine_info(cb,false),1));
        let /*object*/ sp = $subse(s,p); // (scratch)
        // unify duplicate elements, eg "abbc" -> 1224
        for (let i=2, i$lim=l; i<=i$lim; i+=1) {
            let /*integer*/ ti = $subse(tags,i);
            if (equal($subse(s,ti),sp)) {
                tags = $repe(tags,i,p);
                uses = $repe(uses,p,$subse(uses,p)+(1));
                dups += 1;
            } else {
                sp = $subse(s,ti);
                p = ti;
            }
        }
        tags = sort(tags); // (first instance order)
        let /*atom*/ kth = 1,  // (this is the kth permute)
                     tk = factorial(l); // (of tk in total)
        if (dups) {  // ((and k=l[ength(s)]...?))
            for (let ui$idx = 1, ui$lim = length(uses); ui$idx <= ui$lim; ui$idx += 1) { let ui = $subse(uses,ui$idx);
                if (ui>1) { tk /= factorial(ui); }
            }
//      elsif k<length(s) then -- ((and dups=0...?))
        } else if (k<l) { // ((and dups=0...?))
//          tk /= factorial(length(s)-k)
            tk /= factorial(l-k);
//      else -- ((...?))
//          tk = -1 -- ((or perhaps full below less the extract bit...?))
        }
        while (true) {
            if (high_p<=k) {
                let /*sequence*/ sk = extract(s,$subss(tags,1,k));
                if (cb===0) {
                    res = append(res,sk);
                } else {
                    let /*bool*/ quit = 
                                        !((maxparam===1) ? cb(sk) : ((maxparam===2) ? cb(sk,kth) : cb(sk,kth,tk)));
                    if (quit) { return ["sequence"]; }
                }
            }
            // find a {p,l} to swap, eg 1234 -> 1243
            //   or (see reverse below) 1432 -> 2431
            p = l-1;
            while (p && compare($subse(tags,p),$subse(tags,p+1))>=0) {
                p -= 1;
            }
            if (p<1) {  // (all done, eg 4321)
//              assert(kth==tk or (dups!=0 and k<length(s)))
                assert((kth===tk) || ((dups!==0) && k<l));
                if (cb===0) { break; }
                return ["sequence"];
            }
            let /*integer*/ tp = $subse(tags,p);
            while (compare($subse(tags,l),tp)<=0) {
                l -= 1;
            }
            assert(p<l);
            high_p = p;
            tags = $repe(tags,p,$subse(tags,l));
            tags = $repe(tags,l,tp);
            // eg 1432 -> 2431 above -> 2134 (lowest lexico post-p)
//          tags[p+1..$] = reverse(tags[p+1..$]) [, but respecting k]
            p += 1;
            l = length(s);
            while (p<l && p<=k) {
                tp = $subse(tags,p);
                tags = $repe(tags,p,$subse(tags,l));
                tags = $repe(tags,l,tp);
                p += 1;
                l -= 1;
            }
            if (high_p<=k) {  // ((and tk!=-1...?))
                kth += 1;
                assert(kth<=tk);
            }
            l = length(s);
        }
    }
    return res;
}
// here's a simplified version I wrote for Go (zebra puzzle), which 
// needed all permutations of {1,2,3,4,5} [matches permutes(tagset(5))]:
 /*
function premutes(integer i)
    if i<=1 then return {repeat(1,i)} end if
    sequence s = premutes(i-1), res = {}, 
             r = repeat(0,i)
    for k=1 to i do
        r[1] = k
        for si in s do
            for j=2 to i do
                integer sj = si[j-1]
                r[j] = sj+(sj>=k)
            end for
            res = append(res,deep_copy(r))
        end for
    end for
    return res
end function
*/ 

/*global*/ function combinations(/*sequence*/ s, /*integer*/ k, at=1, /*sequence*/ res=["sequence"], part="") {
    //
    // eg join(combinations("123",2),',') ==> "12,13,23"
    //
    if (k===0) { // got a full set
        res = append(res,part);
    } else {
        if (equal(res,["sequence"])) { s = unique(s); }
        if (compare((at+k)-1,length(s))<=0) {
            // get all combinations with and without the next item:
            res = combinations(s,k-1,at+1,res,append(deep_copy(part),$subse(s,at)));
            res = combinations(s,k,at+1,res,part);
        }
    }
    return res;
}

/*global*/ function combinations_with_repetitions(/*sequence*/ s, /*integer*/ k=length(s), at=1, /*sequence*/ res=["sequence"], part="") {
    //
    // eg join(combinations_with_repetitions("123",2),',') ==> "11,12,13,22,23,33"
    //
    if (equal(length(part),k)) {
        res = append(res,part);
    } else {
        if (equal(res,["sequence"])) { s = unique(s); }
        { let sat$lim = length(s); for (at = at; at <= sat$lim; at += 1) { let sat = $subse(s,at);
            res = combinations_with_repetitions(s,k,at,res,append(deep_copy(part),sat));
        }}
    }
    return res;
}
/*
From rc:Permutations with repetitions:
The task is equivalent to simply counting in base=length(set), from 1 to power(base,n).
Asking for the 0th permutation just returns the total number of permutations (ie "").
Results can be generated in any order, hence early termination is quite simply a non-issue.
[AH, so probably not that helpful... what I want is non-descending permutations...]
with javascript_semantics
function permrep(sequence set, integer n, idx=0)
    integer base = length(set),
            nperm = power(base,n)
    if idx=0 then
        -- return the number of permutations
        return nperm
    end if
    -- return the idx'th [1-based] permutation
    if idx<1 or idx>nperm then ?9/0 end if
    idx -= 1    -- make it 0-based
    sequence res = ""
    for i=1 to n do
        res = prepend(res,set[mod(idx,base)+1])
        idx = floor(idx/base)   
    end for
    if idx!=0 then ?9/0 end if -- sanity check
    return res
end function

-- Some slightly excessive testing:

procedure show_all(sequence set, integer n, lo=1, hi=0)
    integer l = permrep(set,n)
    if hi=0 then hi=l end if
    sequence s = repeat(0,l)
    for i=1 to l do
        s[i] = permrep(set,n,i)
    end for
    string mx = iff(hi=l?"":sprintf("/%d",l)),
          pof = sprintf("perms[%d..%d%s] of %v",{lo,hi,mx,set})
    printf(1,"Len %d %-35s: %v\n",{n,pof,shorten(s[lo..hi],"",3)})
end procedure
 
show_all("123",1)
show_all("123",2)
show_all("123",3)
show_all("456",3)
show_all({1,2,3},3)
show_all({"bat","fox","cow"},2)
show_all("XYZ",4,31,36)
 
integer l = permrep("ACKR",5)
for i=1 to l do
    if permrep("ACKR",5,i)="CRACK" then -- 455
        printf(1,"Len 5 perm %d/%d of \"ACKR\" : CRACK\n",{i,l})
        exit
    end if
end for
--The 590th (one-based) permrep is KCARC, ie reverse(CRACK), matching the 589 result of 0-based idx solutions
printf(1,"reverse(permrep(\"ACKR\",5,589+1):%s\n",{reverse(permrep("ACKR",5,590))})
Output:
Len 1 perms[1..3] of "123"               : {"1","2","3"}
Len 2 perms[1..9] of "123"               : {"11","12","13","...","31","32","33"}
Len 3 perms[1..27] of "123"              : {"111","112","113","...","331","332","333"}
Len 3 perms[1..27] of "456"              : {"444","445","446","...","664","665","666"}
Len 3 perms[1..27] of {1,2,3}            : {{1,1,1},{1,1,2},{1,1,3},"...",{3,3,1},{3,3,2},{3,3,3}}
Len 2 perms[1..9] of {"bat","fox","cow"} : {{"bat","bat"},{"bat","fox"},{"bat","cow"},"...",{"cow","bat"},{"cow","fox"},{"cow","cow"}}
Len 4 perms[31..36/81] of "XYZ"          : {"YXYX","YXYY","YXYZ","YXZX","YXZY","YXZZ"}
Len 5 perm 455/1024 of "ACKR" : CRACK
reverse(permrep("ACKR",5,589+1):CRACK
*/

//probably dead...
//DEV these are non-unique/"impossible" combinations... more thought required<br>
 /*
global function combination(integer k, n, sequence set)
--
-- return the kth combination of length n items from the given set.
-- k should be an integer in the range 1 to power(length(set),n)
--
    integer l = length(set)
    if k<1 or k>power(l,n) then ?9/0 end if
    k -= 1
    sequence res = repeat(' ',n)
    for i=n to 1 by -1 do
        integer m = remainder(k,l)+1
        res[i] = set[m]
        k = floor(k/l)
    end for
    return res
end function

--/!*
sequence set = "123",
         res = repeat(0,power(length(set),3))
for k=1 to length(res) do
    res[k] = combination(k,3,set)
end for
?length(res)
puts(1,join_by(res,1,9))
puts(1,"===\n")
puts(1,join_by(res,3,9))
--*!/

--/@
27
111   112   113   121   122   123   131   132   133
211   212   213   221   222   223   231   232   233
311   312   313   321   322   323   331   332   333
===
111   121   131   211   221   231   311   321   331
112   122   132   212   222   232   312   322   332
113   123   133   213   223   233   313   323   333
"done"

sequence set = "1234",
         res = repeat(0,power(length(set),3))
for k=1 to length(res) do
    res[k] = combination(k,3,set)
end for
?length(res)
puts(1,join_by(res,1,16))
puts(1,"===\n")
puts(1,join_by(res,4,16))
--@/

--/@
sequence set = "1234",
         res = repeat(0,power(length(set),4))
for k=1 to length(res) do
    res[k] = combination(k,4,set)
end for
?length(res)
puts(1,join_by(res,1,16))
puts(1,"===\n")
puts(1,join_by(res,16,16))
--@/

*/ 
